import { Suspense } from 'react'
import ConnectClient from './ConnectClient'

export default function ConnectPage() {
    return (
        <Suspense fallback={<div className="text-white p-4">Загрузка...</div>}>
            <ConnectClient />
        </Suspense>
    )
}
