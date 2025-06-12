import { Route, Routes } from "react-router-dom"; //React Routerのインポート
import Login from "./components/Login"; //Loginコンポーネントのインポート
import Home from "./components/Home"; //Homeコンポーネントのインポート
import Register from "./components/Register"; //Registerコンポーネントのインポート
import UpdatePassword from "./components/UpdatePassword"; //UpdatePasswordコンポーネントのインポート
import SendReset from "./components/SendReset"; //SendResetコンポーネントのインポート
function App() {
  return (
    <>
      {/* 子要素がない場合は自己閉じタグ、子要素がある場合は既存タグを用いる */}

      <Routes>
        <Route
          path="/"
          element={<Home />} //Homeコンポーネントのルーティング設定
        />
        <Route
          path="/login"
          element={<Login />} //Loginコンポーネントのルーティング設定
        />
        <Route
          path="/register"
          element={<Register />} //Registerコンポーネントのルーティング設定
        />
        <Route
          path="/updatePassword"
          element={<UpdatePassword />} //UpdatePasswordコンポーネントのインポートのルーティング設定
        ></Route>
        <Route
          path="/sendReset"
          element={<SendReset />} //SendResetのルーティング設定
        ></Route>
      </Routes>
    </>
  );
}

export default App;
