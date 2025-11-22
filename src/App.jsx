/* global __app_id, __firebase_config, __initial_auth_token */
import React, { useState, useEffect, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, collection, query, onSnapshot, updateDoc } from 'firebase/firestore';

// --- CONFIGURACIÓN DE FIREBASE Y UTILIDADES ---
// Variables globales proporcionadas por el entorno de Canvas.
const localFirebaseConfig = {
    // ⚠️ ATENCIÓN: DEBES REEMPLAZAR ESTOS VALORES CON LA CONFIGURACIÓN REAL DE TU PROYECTO DE FIREBASE
    apiKey: "YOUR_API_KEY", 
    authDomain: "YOUR_AUTH_DOMAIN", 
    projectId: "your-project-id-12345", 
    // Otros campos necesarios:
    storageBucket: "your-project-id-12345.appspot.com",
    messagingSenderId: "1234567890",
    appId: "1:1234567890:web:abcdef1234567890",
    measurementId: "G-XXXXXXXXXX"
};

// Si las variables de Canvas no están definidas (desarrollo local), se usa la configuración local.
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' && __firebase_config !== '{}' ? __firebase_config : JSON.stringify(localFirebaseConfig));
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// Inicialización de la aplicación Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Modelo de datos para la aplicación
const initialProduct = { name: '', price: 0, description: '', category: 'Platos', imageUrl: 'https://placehold.co/100x100/A0522D/ffffff?text=Producto', isFeatured: false };

// --- COMPONENTE PRINCIPAL APP ---
const App = () => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [page, setPage] = useState('home'); // 'home', 'products', 'forum', 'cart', 'adminOrders', etc.
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]); // MOVIDO AL ALCANCE GLOBAL DE APP
  const [cart, setCart] = useState({}); // {productId: {productData, quantity}}
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [productToEdit, setProductToEdit] = useState(initialProduct);

  // URL Placeholder para el logo subido
  const logoUrl = "uploaded:image_195462.png-a87605ff-b6cf-4211-87ae-429998d13f7b";

  // URL base para colecciones de datos públicos y privados
  const getPublicCollectionRef = (collectionName) => collection(db, `artifacts/${appId}/public/data/${collectionName}`);
  
  // Función mejorada para cambiar de página y, opcionalmente, establecer el producto a editar
  const navigate = (newPage, data = null) => {
    if (newPage === 'adminEditProduct' && data) {
      setProductToEdit(data);
    } else {
      setProductToEdit(initialProduct);
    }
    setPage(newPage);
  };

  // Funciones de utilidad de la UI
  const addNotification = (message, type = 'info') => {
    const newNotif = { id: Date.now(), message, type };
    setNotifications(prev => [...prev, newNotif]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== newNotif.id));
    }, 3000);
  };
  
  // --- RF-1: CONTROL DE ACCESO (Autenticación y Roles) ---
  useEffect(() => {
    const authenticate = async () => {
      try {
        if (initialAuthToken) {
          await signInWithCustomToken(auth, initialAuthToken);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error("Error durante la autenticación:", error);
        addNotification("Error de autenticación. Revisa tu clave de API.", 'error');
        await signInAnonymously(auth);
      }
    };
    
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Lógica simple de roles.
        // ADVERTENCIA: Debes reemplazar 'admin-uid-ejemplo' por el UID real del administrador en producción.
        // Para pruebas locales: si quieres ser admin, puedes obtener tu UID después de iniciar sesión por primera vez e insertarlo aquí.
        const isAdminUser = currentUser.uid === 'admin-uid-ejemplo'; 
        setIsAdmin(isAdminUser);
        console.log(`Usuario autenticado. ID: ${currentUser.uid}, Es Admin: ${isAdminUser}`);
      } else {
        setUser(null);
        setIsAdmin(false);
        console.log("Usuario no autenticado (Invitado)");
      }
      setIsAuthReady(true);
      setIsLoading(false);
    });

    authenticate();
    return () => unsubscribe();
  }, []);

  // --- RF-4: VISUALIZACIÓN DEL CATÁLOGO (Carga de Productos) ---
  useEffect(() => {
    if (!isAuthReady) return;

    console.log("Configurando listener de productos...");
    const productsCollectionRef = getPublicCollectionRef('products');
    
    const unsubscribe = onSnapshot(productsCollectionRef, (snapshot) => {
      const productList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProducts(productList);
      console.log(`Productos cargados: ${productList.length}`);
    }, (error) => {
      console.error("Error al cargar productos:", error);
      addNotification("Error al cargar productos.", 'error');
    });

    return () => unsubscribe();
  }, [isAuthReady]);

  // --- RF-18: CONSULTA DE PEDIDOS CONFIRMADOS (Carga Global) ---
  useEffect(() => {
    if (!isAuthReady || !isAdmin) return; // Solo cargar si es Admin y la autenticación está lista

    console.log("Configurando listener de pedidos...");
    const ordersCollectionRef = getPublicCollectionRef('orders');
    const q = query(ordersCollectionRef);
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const orderList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })).sort((a, b) => b.createdAt?.toDate() - a.createdAt?.toDate()).reverse(); // Ordenar por fecha
      
      setOrders(orderList); // Actualiza el estado global de pedidos
      console.log(`Pedidos cargados: ${orderList.length}`);
    }, (error) => {
      console.error("Error al cargar pedidos:", error);
    });

    return () => unsubscribe();
  }, [isAuthReady, isAdmin]); // Se ejecuta cuando la autenticación cambia o el rol cambia.

  const totalCartItems = Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);

  // --- RF-6: ADICIÓN DE PRODUCTOS AL CARRITO ---
  const handleAddToCart = (product) => {
    setCart(prevCart => {
      const existingItem = prevCart[product.id];
      const quantity = existingItem ? existingItem.quantity + 1 : 1;
      
      addNotification(`"${product.name}" agregado al carrito.`, 'success');
      
      return {
        ...prevCart,
        [product.id]: { ...product, quantity }
      };
    });
  };

  // --- RF-8: CÁLCULO Y PRESENTACIÓN DEL TOTAL ---
  const calculateTotal = () => {
    return Object.values(cart).reduce((total, item) => total + (item.price * item.quantity), 0);
  };
  
  // --- RF-9 & RF-10: CONFIRMACIÓN DE PEDIDO Y GENERACIÓN DE TICKET ---
  const handleConfirmOrder = async () => {
    if (Object.keys(cart).length === 0) {
      addNotification("El carrito está vacío.", 'error');
      return;
    }

    // Se asume que el usuario ya proporcionó su información (RF-9 Restricción)
    // En una versión completa, se mostraría un formulario aquí.

    const orderData = {
      items: Object.values(cart),
      total: calculateTotal(),
      userId: user?.uid || 'invitado',
      ticketNumber: `TK-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`,
      status: 'Pendiente',
      createdAt: new Date(),
    };

    try {
      const ordersCollectionRef = getPublicCollectionRef('orders');
      const orderDocRef = doc(ordersCollectionRef, orderData.ticketNumber); 
      await setDoc(orderDocRef, orderData);

      addNotification(`¡Pedido Confirmado! Ticket N°: ${orderData.ticketNumber}`, 'success');
      setCart({}); // Vaciar carrito después de la compra
      navigate('home'); // Volver al inicio
    } catch (e) {
      console.error("Error al confirmar el pedido: ", e);
      addNotification("Error al procesar el pedido.", 'error');
    }
  };

  // --- RF-11 a RF-16: GESTIÓN DE PRODUCTOS Y NOTICIAS (ADMIN) ---

  // Funciones CRUD simples para productos (Admin)
  const handleSaveProduct = async (productData, isEditing) => {
    try {
      const productsCollectionRef = getPublicCollectionRef('products');
      if (isEditing) {
        // Actualizar (RF-12)
        const docRef = doc(productsCollectionRef, productData.id);
        // Asegurar que solo se guarden los campos necesarios
        const { id, ...dataToUpdate } = productData; 
        await updateDoc(docRef, dataToUpdate);
        addNotification(`Producto "${productData.name}" actualizado.`, 'success');
      } else {
        // Agregar (RF-11)
        const newDocRef = doc(productsCollectionRef); // Firestore genera un ID
        await setDoc(newDocRef, { ...productData, isActive: true });
        addNotification(`Producto "${productData.name}" agregado.`, 'success');
      }
      navigate('products'); // Volver a la vista de productos
    } catch (e) {
      console.error("Error al guardar producto:", e);
      addNotification("Error al guardar el producto.", 'error');
    }
  };

  const handleDeleteProduct = async (productId, name) => {
    // NOTA: Reemplazar window.confirm() con un modal de React en una aplicación de producción.
    const confirmed = window.confirm(`¿Estás seguro de eliminar (lógicamente) el producto: ${name}?`);
    if (!confirmed) return;
    
    try {
      // Eliminación Lógica (RF-13: cambiando un campo 'isActive' a false)
      const productsCollectionRef = getPublicCollectionRef('products');
      const docRef = doc(productsCollectionRef, productId);
      await updateDoc(docRef, { isActive: false });
      addNotification(`Producto "${name}" eliminado lógicamente.`, 'info');
    } catch (e) {
      console.error("Error al eliminar producto:", e);
      addNotification("Error al eliminar el producto.", 'error');
    }
  };
  
  // --- SUB-COMPONENTE ProductCard ---
  const ProductCard = ({ product }) => (
    <div className="bg-white p-4 shadow-lg rounded-xl flex flex-col transition duration-300 hover:shadow-2xl">
      <img
        src={product.imageUrl}
        alt={product.name}
        className="h-40 w-full object-cover rounded-lg mb-4"
        onError={(e) => e.target.src = 'https://placehold.co/160x160/F5F5DC/696969?text=Sin+Imagen'}
      />
      <div className="flex-grow">
        <h3 className="text-xl font-bold text-gray-800 mb-1">{product.name}</h3>
        <p className="text-2xl font-extrabold text-amber-700 mb-2">${product.price.toFixed(2)}</p>
        <p className="text-sm text-gray-600 line-clamp-2 mb-4">{product.description}</p>
      </div>
      <button
        onClick={() => handleAddToCart(product)}
        className="mt-2 w-full bg-amber-600 text-white py-2 px-4 rounded-lg font-semibold shadow-md hover:bg-amber-700 transition duration-150"
      >
        Agregar al Carrito
      </button>
      {isAdmin && (
        <div className="mt-2 flex space-x-2">
          {/* Al hacer clic en editar, usamos la función navigate mejorada */}
          <button 
            onClick={() => navigate('adminEditProduct', product)} 
            className="flex-1 bg-blue-500 text-white text-sm py-1 rounded-lg hover:bg-blue-600"
          >
            Editar
          </button>
          <button 
            onClick={() => handleDeleteProduct(product.id, product.name)} 
            className="flex-1 bg-red-500 text-white text-sm py-1 rounded-lg hover:bg-red-600"
          >
            Eliminar
          </button>
        </div>
      )}
    </div>
  );
  
  // --- SUB-COMPONENTE HomeView ---
  const HomeView = () => {
    // RF-2: Mostrar productos "más llamativos" (isFeatured: true)
    const featuredProducts = products.filter(p => p.isFeatured && p.isActive !== false);

    return (
      <div className="p-6">
        <h1 className="text-4xl font-serif text-center text-amber-800 mb-8">Bienvenidos al Taller de Conde Cerámicas</h1>
        <p className="text-center text-gray-600 mb-10">Descubre piezas únicas hechas a mano con amor y dedicación. Navega por nuestros productos o mira nuestras novedades.</p>
        
        <h2 className="text-3xl font-bold text-gray-700 mb-6 border-b-2 border-amber-300 pb-2">Productos Destacados</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {featuredProducts.length > 0 ? (
            featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <p className="col-span-full text-center text-gray-500">No hay productos destacados disponibles.</p>
          )}
        </div>
      </div>
    );
  };
  
  // --- SUB-COMPONENTE ProductsView ---
  const ProductsView = () => {
    const [filter, setFilter] = useState('all');
    const categories = ['Platos', 'Tazas', 'Bowls', 'Maceteros', 'Ceniceros', 'Otros'];
    
    // RF-5: Aplicación de filtros
    const filteredProducts = products.filter(p => 
      p.isActive !== false && (filter === 'all' || p.category === filter)
    );

    return (
      <div className="p-6">
        <h1 className="text-4xl font-serif text-amber-800 mb-6">Catálogo Completo</h1>
        
        {/* Filtros RF-5 */}
        <div className="mb-6 flex flex-wrap gap-2 items-center">
          <span className="font-semibold text-gray-700 mr-2">Filtrar por:</span>
          <button 
            onClick={() => setFilter('all')} 
            className={`px-4 py-2 text-sm rounded-full transition ${filter === 'all' ? 'bg-amber-700 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            Todos
          </button>
          {categories.map(cat => (
            <button 
              key={cat} 
              onClick={() => setFilter(cat)} 
              className={`px-4 py-2 text-sm rounded-full transition ${filter === cat ? 'bg-amber-700 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.length > 0 ? (
            filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <p className="col-span-full text-center text-gray-500">No hay productos que coincidan con el filtro.</p>
          )}
        </div>
        
        {isAdmin && (
          <div className="mt-8 text-center">
            <button 
              onClick={() => navigate('adminAddProduct')} 
              className="bg-green-600 text-white py-3 px-6 rounded-lg font-bold shadow-md hover:bg-green-700 transition"
            >
              + Agregar Nuevo Producto
            </button>
          </div>
        )}
      </div>
    );
  };
  
  // --- SUB-COMPONENTE CartView ---
  const CartView = () => {
    // RF-7: Visualización del resumen de la Canasta de Compra
    const cartItems = Object.values(cart);
    const total = calculateTotal(); // RF-8
    
    // Función de utilidad para manejar el cambio de cantidad
    const updateQuantity = (productId, change) => {
      setCart(prevCart => {
        const item = prevCart[productId];
        const newQuantity = item.quantity + change;
        
        if (newQuantity <= 0) {
          // Eliminar si la cantidad es 0 o menos
          const { [productId]: deletedItem, ...rest } = prevCart;
          addNotification(`Producto eliminado del carrito.`, 'info');
          return rest;
        }
        
        // Actualizar cantidad
        return {
          ...prevCart,
          [productId]: { ...item, quantity: newQuantity }
        };
      });
    };

    return (
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-4xl font-serif text-amber-800 mb-6 border-b pb-2">Canasta de Compra ({cartItems.length} ítems)</h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-lg shadow-inner">
            <p className="text-xl text-gray-500">Tu carrito está vacío. ¡Explora nuestros productos!</p>
            <button onClick={() => navigate('products')} className="mt-4 text-amber-600 hover:underline">Ver Catálogo</button>
          </div>
        ) : (
          <div className="space-y-4">
            {cartItems.map(item => (
              <div key={item.id} className="flex items-center bg-white p-4 rounded-lg shadow-md">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded-md mr-4"
                  onError={(e) => e.target.src = 'https://placehold.co/64x64/F5F5DC/696969?text=Sin+Imagen'}
                />
                <div className="flex-grow">
                  <h3 className="text-lg font-semibold">{item.name}</h3>
                  <p className="text-sm text-gray-500">{item.description.substring(0, 50)}...</p>
                </div>
                <div className="flex items-center space-x-3 mx-4">
                  <button onClick={() => updateQuantity(item.id, -1)} className="bg-gray-200 text-gray-700 w-8 h-8 rounded-full hover:bg-gray-300">-</button>
                  <span className="font-bold">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, 1)} className="bg-gray-200 text-gray-700 w-8 h-8 rounded-full hover:bg-gray-300">+</button>
                </div>
                <p className="text-xl font-bold text-amber-700 w-24 text-right">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
            
            <div className="text-right pt-4 border-t-2 border-amber-300 mt-6">
              <h2 className="text-3xl font-extrabold text-gray-800">Total: ${total.toFixed(2)}</h2>
              <button
                onClick={handleConfirmOrder} // RF-9: Confirmar pedido
                className="mt-4 bg-green-600 text-white py-3 px-8 rounded-lg font-bold text-lg shadow-xl hover:bg-green-700 transition duration-200 transform hover:scale-105"
              >
                Confirmar Pedido
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  // --- SUB-COMPONENTE AdminProductForm ---
  const AdminProductForm = ({ productToEdit }) => {
    // El producto a editar ahora se gestiona directamente en el estado `productToEdit` del App.
    const isEditing = !!productToEdit.id;
    const [productData, setProductData] = useState(productToEdit || initialProduct);

    // Actualizamos el estado local del formulario si el producto a editar cambia (navegación)
    useEffect(() => {
        setProductData(productToEdit || initialProduct);
    }, [productToEdit]);

    const handleChange = (e) => {
      const { name, value, type, checked } = e.target;
      setProductData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : (type === 'number' ? parseFloat(value) || 0 : value)
      }));
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      // Asegurar que 'isActive' exista para eliminación lógica
      const finalData = { ...productData, isActive: productData.isActive !== false };
      handleSaveProduct(finalData, isEditing);
    };

    const categories = ['Platos', 'Tazas', 'Bowls', 'Maceteros', 'Ceniceros', 'Otros'];

    return (
      <div className="p-6 max-w-xl mx-auto bg-white shadow-2xl rounded-xl">
        <h1 className="text-3xl font-bold text-amber-800 mb-6">{isEditing ? 'Editar Producto' : 'Agregar Nuevo Producto'}</h1>
        
        {/* Formulario de Administración de Productos (RF-11 / RF-12) */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <label className="block">
            <span className="text-gray-700">Nombre del Producto:</span>
            <input 
              type="text" 
              name="name" 
              value={productData.name} 
              onChange={handleChange} 
              required 
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
            />
          </label>
          
          <div className="flex space-x-4">
            <label className="block flex-1">
              <span className="text-gray-700">Precio ($):</span>
              <input 
                type="number" 
                name="price" 
                value={productData.price} 
                onChange={handleChange} 
                min="0.01"
                step="0.01"
                required 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
              />
            </label>
            <label className="block flex-1">
              <span className="text-gray-700">Categoría:</span>
              <select 
                name="category" 
                value={productData.category} 
                onChange={handleChange} 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
              >
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </label>
          </div>

          <label className="block">
            <span className="text-gray-700">URL de Imagen:</span>
            <input 
              type="text" 
              name="imageUrl" 
              value={productData.imageUrl} 
              onChange={handleChange} 
              required 
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
            />
          </label>

          <label className="block">
            <span className="text-gray-700">Descripción:</span>
            <textarea 
              name="description" 
              value={productData.description} 
              onChange={handleChange} 
              rows="3" 
              required 
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
            />
          </label>
          
          <label className="flex items-center space-x-2">
            <input 
              type="checkbox" 
              name="isFeatured" 
              checked={productData.isFeatured} 
              onChange={handleChange} 
              className="rounded text-amber-600"
            />
            <span className="text-gray-700">Marcar como Destacado (RF-2)</span>
          </label>

          <div className="flex justify-end space-x-4 pt-4">
            <button 
              type="button" 
              onClick={() => navigate('products')} 
              className="bg-gray-300 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-400 transition"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="bg-amber-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-amber-700 transition"
            >
              {isEditing ? 'Guardar Cambios' : 'Crear Producto'}
            </button>
          </div>
        </form>
      </div>
    );
  };
  
  // --- SUB-COMPONENTE AdminOrdersView ---
  const AdminOrdersView = () => {
    // Ya no necesita el estado local ni el useEffect, ya que 'orders' viene del App principal.
    const [orderStatus, setOrderStatus] = useState({});
    
    // Inicializar el estado local de status para cada orden cargada globalmente
    useEffect(() => {
        if (orders.length > 0) {
            const initialStatus = orders.reduce((acc, order) => {
                acc[order.id] = order.status;
                return acc;
            }, {});
            setOrderStatus(initialStatus);
        }
    }, [orders]); // Se ejecuta cuando la lista de orders cambia
    
    // RF-20: Actualización del estado del pedido
    const handleUpdateStatus = async (orderId) => {
      const newStatus = orderStatus[orderId];
      if (!newStatus) return;

      try {
        const orderDocRef = doc(getPublicCollectionRef('orders'), orderId);
        await updateDoc(orderDocRef, { status: newStatus });
        addNotification(`Estado del Pedido ${orderId} actualizado a ${newStatus}.`, 'success');
      } catch (e) {
        console.error("Error al actualizar estado:", e);
        addNotification("Error al actualizar el estado del pedido.", 'error');
      }
    };
    
    const statusOptions = ['Pendiente', 'En Preparación', 'Enviado', 'Entregado', 'Cancelado'];

    return (
      <div className="p-6">
        <h1 className="text-4xl font-bold text-gray-700 mb-6">Gestión de Pedidos Confirmados</h1>
        
        <div className="space-y-6">
          {orders.length === 0 ? (
            <p className="text-center text-gray-500">No hay pedidos confirmados.</p>
          ) : (
            orders.map(order => (
              <div key={order.id} className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-amber-500">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-extrabold text-amber-700">Ticket N°: {order.ticketNumber}</h2>
                    {/* El usuario ID es importante para identificar la compra */}
                    <p className="text-sm text-gray-500">Cliente ID: {order.userId}</p>
                    <p className="text-sm text-gray-500">Fecha: {order.createdAt?.toDate().toLocaleString() || 'N/A'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-green-600">${order.total.toFixed(2)}</p>
                    <p className={`font-bold text-sm mt-1 px-3 py-1 rounded-full 
                      ${order.status === 'Pendiente' ? 'bg-red-100 text-red-700' : 
                        order.status === 'Cancelado' ? 'bg-gray-200 text-gray-700' :
                        'bg-green-100 text-green-700'}`}>
                      Estado: {order.status}
                    </p>
                  </div>
                </div>

                {/* RF-19: Detalle de los productos con imagen */}
                <div className="border-t pt-4 mt-4">
                  <h3 className="font-semibold text-gray-700 mb-2">Productos ({order.items.length}):</h3>
                  <div className="flex space-x-3 overflow-x-auto pb-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex-shrink-0 w-24 text-center">
                        <img 
                          src={item.imageUrl} 
                          alt={item.name} 
                          className="w-20 h-20 object-cover rounded-md mx-auto"
                          onError={(e) => e.target.src = 'https://placehold.co/80x80/F5F5DC/696969?text=Sin+Imagen'}
                        />
                        <p className="text-xs mt-1 truncate">{item.name} (x{item.quantity})</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* RF-20: Formulario de actualización de estado */}
                <div className="flex items-center space-x-4 mt-4 pt-4 border-t">
                  <label className="text-sm font-medium text-gray-700">Actualizar Estado:</label>
                  <select 
                    value={orderStatus[order.id] || order.status} 
                    onChange={(e) => setOrderStatus(prev => ({ ...prev, [order.id]: e.target.value }))}
                    className="p-2 border rounded-md text-sm"
                  >
                    {statusOptions.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                  <button 
                    onClick={() => handleUpdateStatus(order.id)} 
                    className="bg-blue-500 text-white text-sm px-3 py-2 rounded-lg hover:bg-blue-600 transition"
                  >
                    Guardar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };
  
  // Lógica para renderizar la vista correcta (Router simple)
  const renderPage = () => {
    switch (page) {
      case 'home':
        return <HomeView />;
      case 'products':
        return <ProductsView />;
      case 'cart':
        return <CartView />;
      case 'adminEditProduct':
        // Utilizamos el estado `productToEdit` para cargar el formulario de edición
        return <AdminProductForm productToEdit={productToEdit} />;
      case 'adminAddProduct':
        // Se pasa el `initialProduct` para el formulario de adición (la navegación ya reinicia `productToEdit`)
        return <AdminProductForm productToEdit={productToEdit} />;
      case 'adminOrders':
        return <AdminOrdersView />;
      case 'forum':
        return <div className="p-6 text-center text-xl text-gray-500">Foro de Noticias (A implementar: RF-14, RF-15, RF-16, RF-17)</div>;
      default:
        return <HomeView />;
    }
  };
  
  // --- RENDERIZADO PRINCIPAL ---
  if (isLoading || !isAuthReady) {
    return <div className="flex justify-center items-center h-screen text-2xl text-amber-700">Cargando la aplicación...</div>;
  }
  
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      
      {/* Barra de Notificaciones */}
      <div className="fixed top-0 right-0 m-4 z-50 space-y-2">
        {notifications.map(n => (
          <div 
            key={n.id} 
            className={`p-3 rounded-lg shadow-xl text-white ${n.type === 'success' ? 'bg-green-500' : n.type === 'error' ? 'bg-red-500' : 'bg-blue-500'}`}
          >
            {n.message}
          </div>
        ))}
      </div>
      
      {/* Barra de Navegación (RF-2, RF-3) */}
      <header className="bg-white shadow-md sticky top-0 z-10">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          
          <div className="flex items-center space-x-8">
            {/* Logo del Cliente (RF-2) */}
            <div className="flex items-center cursor-pointer" onClick={() => navigate('home')}>
                <img
                    src={logoUrl}
                    alt="Conde Cerámicas Logo"
                    className="h-10 w-auto object-contain invert-0"
                    onError={(e) => {
                        e.target.onerror = null; 
                        e.target.style.display = 'none';
                    }}
                />
                <h1 className="text-3xl font-serif font-extrabold text-amber-700 ml-2">
                  Conde Cerámicas
                </h1>
            </div>
            
            {/* Botones de Navegación */}
            <button className="text-gray-600 hover:text-amber-600 font-medium" onClick={() => navigate('home')}>
              Inicio
            </button>
            <button className="text-gray-600 hover:text-amber-600 font-medium" onClick={() => navigate('products')}>
              Productos
            </button>
            <button className="text-gray-600 hover:text-amber-600 font-medium" onClick={() => navigate('forum')}>
              Foro de Noticias
            </button>
            
            {/* Opciones de Administrador */}
            {isAdmin && (
              <div className="ml-4 flex space-x-4">
                <button className="text-blue-600 hover:text-blue-800 font-bold" onClick={() => navigate('adminAddProduct')}>
                  + Producto
                </button>
                {/* Ahora usa 'orders.length' que es un estado global de App */}
                <button className="text-blue-600 hover:text-blue-800 font-bold" onClick={() => navigate('adminOrders')}>
                  Pedidos ({orders.length})
                </button>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Carrito de Compra (RF-3) */}
            <button 
              onClick={() => navigate('cart')} 
              className="relative p-2 rounded-full bg-amber-500 text-white hover:bg-amber-600 transition"
              aria-label="Canasta de Compra"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {totalCartItems > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                  {totalCartItems}
                </span>
              )}
            </button>
            
            {/* Información de Usuario (RF-1) */}
            <div className="text-sm text-gray-500">
              {isAdmin ? (
                <span className="font-bold text-red-600">ADMIN</span>
              ) : (
                <span className="text-gray-700">Invitado</span>
              )}
              {user?.uid && <span className="ml-2">({user.uid.substring(0, 4)}...)</span>}
            </div>
          </div>
        </nav>
      </header>
      
      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {renderPage()}
      </main>
    </div>
  );
};

export default App;