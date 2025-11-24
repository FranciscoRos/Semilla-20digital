import { ChevronLeft } from "lucide-react"
import { useNavigate } from "react-router-dom"




export default function GoBack() {
    const navigate=useNavigate()
    return(
        <button 
            onClick={()=>navigate(-1)} 
            className="flex items-center gap-2 text-green-600 font-medium mb-2 hover:underline"
            >
              <ChevronLeft className="w-5 h-5" /> Volver
        </button>
    )
}