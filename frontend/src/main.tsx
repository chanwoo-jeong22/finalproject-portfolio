import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from "./App"    // 확장자 jsx 삭제 권장 (TS에서는 보통 확장자 안 적음)

const root = createRoot(
    document.getElementById('root') as HTMLElement  // 타입 단언 추가
)

root.render(
    <StrictMode>
        <App />
    </StrictMode>,
)
