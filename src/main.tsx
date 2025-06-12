import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import { ChakraProvider } from "@chakra-ui/react";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ChakraProvider>
      {/* ChakraUIをすべてのファイルで使うために最上階層のmain.tsxに配置 */}
      <BrowserRouter>
        {/* 複数のページを持つReactアプリケーションを構築する際に利用されるライブラリ */}
        <App />
      </BrowserRouter>
    </ChakraProvider>
  </StrictMode>
);
