import React, { useState } from 'react';
import { MessageSquare, Users, Eye, ChevronRight, Plus, Search, Home, Sprout, Beef, Fish, TreePine, House } from 'lucide-react';
import { useCategoria } from '@/hooks/useCategoria';
import { useTemas } from '@/hooks/useTemas';

const ForoAgricola = () => {
  const {data,isLoading}=useCategoria()
  const {getTemasId}=useTemas()

  const [currentView, setCurrentView] = useState('home'); // 'home', 'category', 'thread'
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedThread, setSelectedThread] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Datos de ejemplo del foro
  const categories = [
    {
      id: 'agricultura',
      name: 'Agricultura',
      icon: <Sprout className="w-6 h-6" />,
      description: 'Cultivos, siembra y técnicas tradicionales',
      subcategories: [
        { id: 'cultivos', name: 'Cultivos y Siembras', threads: 45, posts: 234 },
        { id: 'suelos', name: 'Suelos y Abonos Naturales', threads: 32, posts: 156 },
        { id: 'plagas', name: 'Control de Plagas Tradicional', threads: 28, posts: 189 },
        { id: 'calendarios', name: 'Calendarios y Predicciones', threads: 19, posts: 95 },
        { id: 'semillas', name: 'Semillas Criollas', threads: 41, posts: 203 }
      ]
    },
    {
      id: 'ganaderia',
      name: 'Ganadería',
      icon: <Beef className="w-6 h-6" />,
      description: 'Crianza de animales y cuidados veterinarios',
      subcategories: [
        { id: 'bovinos', name: 'Bovinos', threads: 38, posts: 187 },
        { id: 'ovinos', name: 'Ovinos y Caprinos', threads: 25, posts: 134 },
        { id: 'aves', name: 'Aves de Corral', threads: 52, posts: 276 },
        { id: 'remedios', name: 'Cuidados y Remedios Caseros', threads: 44, posts: 298 },
        { id: 'pastoreo', name: 'Manejo de Pastoreo', threads: 21, posts: 112 }
      ]
    },
    {
      id: 'pesca',
      name: 'Pesca',
      icon: <Fish className="w-6 h-6" />,
      description: 'Técnicas de pesca artesanal y sostenible',
      subcategories: [
        { id: 'dulce', name: 'Pesca de Agua Dulce', threads: 29, posts: 145 },
        { id: 'marina', name: 'Pesca Marina', threads: 34, posts: 178 },
        { id: 'tecnicas', name: 'Técnicas Artesanales', threads: 22, posts: 98 },
        { id: 'conservacion', name: 'Conservación del Pescado', threads: 18, posts: 87 }
      ]
    },
    {
      id: 'vida-rural',
      name: 'Vida Rural',
      icon: <House className="w-6 h-6" />,
      description: 'Tradiciones, construcción y vida en el campo',
      subcategories: [
        { id: 'construcciones', name: 'Construcciones Tradicionales', threads: 15, posts: 76 },
        { id: 'cocina', name: 'Cocina y Conservas', threads: 67, posts: 389 },
        { id: 'medicina', name: 'Medicina Natural', threads: 48, posts: 267 },
        { id: 'tradiciones', name: 'Tradiciones y Costumbres', threads: 31, posts: 154 }
      ]
    }
  ];

  // Hilos de ejemplo para una subcategoría
  const exampleThreads = [
    {
      id: 1,
      title: 'Mi abuelo predecía la lluvia observando las hormigas',
      author: 'Carlos Méndez',
      generation: 'Joven Agricultor',
      region: 'Michoacán',
      replies: 23,
      views: 456,
      lastActivity: 'Hace 2 horas',
      tags: ['Conocimiento Ancestral', 'Clima', 'Predicciones'],
      verified: true
    },
    {
      id: 2,
      title: '¿Remedios naturales contra el gusano cogollero del maíz?',
      author: 'María Flores',
      generation: 'Agricultora Experimentada',
      region: 'Oaxaca',
      replies: 18,
      views: 234,
      lastActivity: 'Hace 5 horas',
      tags: ['Control de Plagas', 'Maíz', 'Remedios Caseros'],
      verified: false
    },
    {
      id: 3,
      title: 'Técnica ancestral: Conservar semillas de calabaza por años',
      author: 'Don Pedro Ramírez',
      generation: 'Heredero de Tradiciones',
      region: 'Puebla',
      replies: 42,
      views: 892,
      lastActivity: 'Hace 1 día',
      tags: ['Semillas Criollas', 'Conservación', 'Tutorial'],
      verified: true
    },
    {
      id: 4,
      title: 'Calendario lunar para siembra 2025 - Zona Centro',
      author: 'Javier González',
      generation: 'Agricultor Experimentado',
      region: 'Guanajuato',
      replies: 67,
      views: 1543,
      lastActivity: 'Hace 3 días',
      tags: ['Calendario Lunar', 'Siembra', 'Temporada 2025'],
      verified: true
    }
  ];

  // Ejemplo de conversación dentro de un hilo
  const examplePosts = [
    {
      id: 1,
      author: 'Carlos Méndez',
      generation: 'Joven Agricultor',
      region: 'Michoacán',
      timestamp: 'Hace 2 días',
      content: 'Hola a todos. Mi abuelo (q.e.p.d) siempre me decía que cuando las hormigas hacían sus montículos más altos de lo normal, era porque se venía lluvia fuerte en 2-3 días. Yo lo he comprobado y tiene como 80% de acierto. ¿Alguien más conoce esta técnica? ¿Funciona en su región?',
      isOriginalPost: true
    },
    {
      id: 2,
      author: 'Don Pedro Ramírez',
      generation: 'Heredero de Tradiciones',
      region: 'Puebla',
      timestamp: 'Hace 2 días',
      content: '¡Así es muchacho! Mi padre me enseñó lo mismo hace más de 50 años. Las hormigas sienten los cambios de presión atmosférica antes que nosotros. También fíjate en las abejas: cuando vuelan muy bajo, viene agua segura. Y si las vacas se echan todas juntas temprano, también.',
      isOriginalPost: false
    },
    {
      id: 3,
      author: 'María Flores',
      generation: 'Agricultora Experimentada',
      region: 'Oaxaca',
      timestamp: 'Hace 1 día',
      content: 'En mi región observamos también a los pájaros. Cuando los zanates (cuervos) vuelan en círculos bajito, es señal de lluvia cercana. Y si el cielo se pone "aborregado" (nubecitas como ovejas) por la tarde, al otro día amanece lloviendo.',
      isOriginalPost: false
    },
    {
      id: 4,
      author: 'Carlos Méndez',
      generation: 'Joven Agricultor',
      region: 'Michoacán',
      timestamp: 'Hace 5 horas',
      content: '¡Muchas gracias Don Pedro y María! Voy a empezar a observar también las abejas y las vacas. Este tipo de conocimiento es oro puro y no debe perderse. ¿Alguien ha pensado en hacer un calendario o guía con todas estas señales?',
      isOriginalPost: false
    }
  ];

  // Vista principal del foro (categorías)
  const HomeView = () => (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-lg">
        <h1 className="text-3xl font-bold mb-2">🌾 Foro Agricultura Tradicional</h1>
        <p className="text-green-100">Compartiendo el conocimiento de generaciones para las generaciones futuras</p>
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar temas, consejos, técnicas..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {categories.map(category => (
        <div key={category.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="bg-green-100 p-3 rounded-lg text-green-700">
                {category.icon}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-800 mb-1">{category.name}</h2>
                <p className="text-gray-600 text-sm mb-4">{category.description}</p>
                
                <div className="space-y-2">
                  {category.subcategories.map(sub => (
                    <button
                      key={sub.id}
                      onClick={() => {
                        setSelectedCategory({ ...category, selectedSub: sub });
                        setCurrentView('category');
                      }}
                      className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-green-600" />
                        <span className="font-medium text-gray-700">{sub.name}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-4 h-4" />
                          {sub.threads}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {sub.posts}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Vista de subcategoría (lista de hilos)
  const CategoryView = () => (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow p-4">
        <button
          onClick={() => setCurrentView('home')}
          className="flex items-center gap-2 text-green-600 hover:text-green-700 mb-4"
        >
          <Home className="w-4 h-4" />
          Volver al inicio
        </button>
        
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-green-100 p-2 rounded text-green-700">
            {selectedCategory.icon}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{selectedCategory.selectedSub.name}</h2>
            <p className="text-sm text-gray-600">{selectedCategory.name}</p>
          </div>
        </div>
      </div>

      <button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors">
        <Plus className="w-5 h-5" />
        Crear Nuevo Tema
      </button>

      <div className="space-y-3">
        {exampleThreads.map(thread => (
          <button
            key={thread.id}
            onClick={() => {
              setSelectedThread(thread);
              setCurrentView('thread');
            }}
            className="w-full bg-white rounded-lg shadow hover:shadow-md transition-shadow p-4 text-left"
          >
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold text-gray-800">{thread.title}</h3>
                  {thread.verified && (
                    <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">
                      ✓ Verificado
                    </span>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  {thread.tags.map(tag => (
                    <span key={tag} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="font-medium">{thread.author}</span>
                  <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                    {thread.generation}
                  </span>
                  <span>📍 {thread.region}</span>
                </div>
              </div>
              
              <div className="text-right text-sm text-gray-500 space-y-1">
                <div className="flex items-center gap-1">
                  <MessageSquare className="w-4 h-4" />
                  <span>{thread.replies}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>{thread.views}</span>
                </div>
                <div className="text-xs">{thread.lastActivity}</div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  // Vista de hilo individual (conversación)
  const ThreadView = () => (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow p-4">
        <button
          onClick={() => setCurrentView('category')}
          className="flex items-center gap-2 text-green-600 hover:text-green-700 mb-4"
        >
          <ChevronRight className="w-4 h-4 rotate-180" />
          Volver a {selectedCategory.selectedSub.name}
        </button>
        
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-2xl font-bold text-gray-800">{selectedThread.title}</h2>
            {selectedThread.verified && (
              <span className="bg-green-100 text-green-700 text-sm px-3 py-1 rounded-full font-medium">
                ✓ Conocimiento Verificado
              </span>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2">
            {selectedThread.tags.map(tag => (
              <span key={tag} className="bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {examplePosts.map((post, index) => (
          <div
            key={post.id}
            className={`bg-white rounded-lg shadow p-6 ${post.isOriginalPost ? 'border-l-4 border-green-600' : ''}`}
          >
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {post.author.charAt(0)}
                </div>
              </div>
              
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-bold text-gray-800">{post.author}</h4>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs">
                        {post.generation}
                      </span>
                      <span>📍 {post.region}</span>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">{post.timestamp}</span>
                </div>
                
                <p className="text-gray-700 leading-relaxed">{post.content}</p>
                
                {post.isOriginalPost && (
                  <div className="mt-3 flex gap-2">
                    <button className="text-sm text-green-600 hover:text-green-700 font-medium">
                      👍 Útil (15)
                    </button>
                    <button className="text-sm text-gray-600 hover:text-gray-700">
                      💾 Guardar
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-bold text-gray-800 mb-3">Responder al tema</h3>
        <textarea
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          rows={4}
          placeholder="Comparte tu conocimiento o experiencia..."
        />
        <button className="mt-3 bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded-lg font-medium transition-colors">
          Publicar Respuesta
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto p-4">
        {currentView === 'home' && <HomeView />}
        {currentView === 'category' && <CategoryView />}
        {currentView === 'thread' && <ThreadView />}
      </div>
    </div>
  );
};

export default ForoAgricola;