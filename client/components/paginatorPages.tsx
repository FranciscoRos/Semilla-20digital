import { ChevronLeft, ChevronRight } from "lucide-react"
import { useEffect, useState } from "react";





const PaginatorPages =({dataxFiltrar,ITEMS=5,changeDatos})=>{
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(dataxFiltrar.length / ITEMS);

    useEffect(()=>{
    const startIndex = (currentPage - 1) * ITEMS;
    const endIndex = startIndex + ITEMS;
    const paginatedData = dataxFiltrar.slice(startIndex, endIndex);

    changeDatos(paginatedData);
  }, [currentPage, dataxFiltrar, ITEMS]); 

    useEffect(() => setCurrentPage(1), [dataxFiltrar]);
    if(totalPages<=1) return null
    
    return (
        <>
            {/* --- COMPONENTE DE PAGINACIÓN --- */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-4 mt-8">
                                <button 
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                >
                                    <ChevronLeft className="w-5 h-5 text-gray-600"/>
                                </button>
                                
                                <span className="text-sm font-medium text-gray-700">
                                    Página {currentPage} de {totalPages}
                                </span>
            
                                <button 
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                >
                                    <ChevronRight className="w-5 h-5 text-gray-600"/>
                                </button>
                            </div>
                        )}
        </>
    )

}

export default PaginatorPages