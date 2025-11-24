import SDLoading from '@/assets/SDloading.svg'




export default function LoadingSDloading() {
    return(
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-md flex items-center justify-center z-[9999]">
            <img src={SDLoading} alt="Cargando..." width="120" height="120" />
        </div>
    )
}