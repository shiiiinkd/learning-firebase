import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@chakra-ui/react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  updatePassword,
} from "firebase/auth"; //FirebaseSDKのemailログイン機能のインポート
import type { User } from "firebase/auth"; //型のみインポートする際はimport typeとして別で定義しなければいけない
import {
  addDoc,
  collection,
  getDocs,
  deleteDoc,
  query,
  where,
  doc,
  updateDoc,
} from "firebase/firestore"; //firestore関連機能追加
import { auth, db } from "../utils/firebase"; //Firebaseクライアントから認証機能のインポート
import type { StudyData } from "../types/studyData"; //型定義、StudyData追加。型のみインポートする際はimport typeで定義

//const [loading, setLoading] の箇所でカーソルをsetLoadingの上に乗せると型情報をポップアップで表示してくれるから、コピペして定義すると早い
type UseFirebase = () => {
  //useFirebaseの型定義、関数として型定義 (() => {}の形で定義する)
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>; //React.Dispatch<React.SetStateAction<stateの型>>でset関数の型を定義する
  email: string;
  setEmail: React.Dispatch<React.SetStateAction<string>>; //React setStateの型
  password: string;
  setPassword: React.Dispatch<React.SetStateAction<string>>; //React setStateの型
  handleLogin: (e: React.FormEvent<HTMLFormElement>) => Promise<void>; //関数handleLoginの型、/Promise<void>（成功時何も返さない非同期処理）
  user: User | null; //FirebaseSDKによるUser型またはNull
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  learnings: StudyData[]; //追加、FirestoreDBから取得する学習記録の配列、StudyDataの型データによる配列
  setLearnings: React.Dispatch<React.SetStateAction<StudyData[]>>;
  fetchDb: (data: string) => Promise<void>; //Promise<void>（成功時何も返さない非同期処理）を返す関数であることを定義している
  calculateTotalTime: () => number;
  updateDb: (data: StudyData) => Promise<void>;
  entryDb: (data: StudyData) => Promise<void>;
  deleteDb: (data: StudyData) => Promise<void>;
  handleLogout: () => Promise<void>;
  passwordConf: string;
  setPasswordConf: React.Dispatch<React.SetStateAction<string>>;
  handleSignup: (e: React.FormEvent) => Promise<void>;
  currentPassword: string;
  setCurrentPassword: React.Dispatch<React.SetStateAction<string>>;
  handleUpdatePassword: (e: React.FormEvent) => Promise<void>;
  handleResetPassword: (e: React.FormEvent) => Promise<void>;
};

export const useFirebase: UseFirebase = () => {
  //コンポーネントの定義、型はUseFirebaseとして設定
  const [loading, setLoading] = useState(false); //ローディング状態を管理するstateの定義
  const [email, setEmail] = useState(""); //emailを管理するstateの定義
  const [password, setPassword] = useState(""); //passwordを管理するstateの定義
  const [user, setUser] = useState<User | null>(null); // セッションユーザ情報のステート追加
  const [learnings, setLearnings] = useState<StudyData[]>([]); //学習記録データのステート追加
  const [passwordConf, setPasswordConf] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const navigate = useNavigate(); //React RouterのNavigate機能を利用
  const toast = useToast(); //Chakura UIのToastの利用

  ////Authentication
  //ログイン処理
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    //async/awaitによる非同期通信、React.FormEventによるイベントの型
    e.preventDefault(); // submitイベントの本来の動作を抑止(リロードの繰り返しを防いでいる)
    setLoading(true); //ローディングをローディング状態で定義
    try {
      const userLogin = await signInWithEmailAndPassword(auth, email, password); //Firebase SDKによるログイン処理、authは、firebaseクライアントで定義した引数
      console.log("User Logined:", userLogin);
      toast({
        //処理が正常終了すれば、Chakra UIのToastを利用し、ログイン成功メッセージを表示
        title: "ログインしました",
        position: "top",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
      navigate("/"); //ログイン成功後、Home画面("/")に遷移
    } catch (error) {
      console.error("Error during sign in:", error);
      toast({
        //エラー時は、Chakra UIのToastを利用し、エラーメッセージ表示
        title: "ログインに失敗しました",
        description: `${error}`,
        position: "top",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
    } finally {
      setLoading(false); //最終処理としてローディング状態を解除（ローディング完了）
    }
  };

  //ユーザがセッション中か否かの判断処理(useEffectを使用)
  useEffect(() => {
    const unsubscribed = auth.onAuthStateChanged((user) => {
      setUser(user); //userはnullかUserオブジェクト
      if (user) {
        setEmail(user.email as string); //userはnullも取りうるため、string型に定義しないとエラーが出る
      } else {
        //認証が不要なページのパスリスト
        const authNoRequiredPaths = ["/login", "/register", "/sendReset"];
        //現在のパスを取得
        const currentPath = window.location.pathname;

        //現在のパスが認証不要パスでない場合のみリダイレクト
        if (!authNoRequiredPaths.includes(currentPath)) {
          navigate("/login"); //userがセッション中でなければ/loginに移動
        }
      }
    });
    return () => {
      unsubscribed();
    };
  }, [navigate]); //user状態に変化があった時に実行

  ////Firestore
  //Firestoreデータ取得
  const fetchDb = useCallback(async (data: string) => {
    setLoading(true);
    try {
      //tryには本来失敗するかもしれない処理を書く
      const usersCollectionRef = collection(db, "users_learnings");
      const q = query(usersCollectionRef, where("email", "==", data)); // emailのデータが、ログインユーザーのemailとマッチするするものを取得
      const querySnapshot = await getDocs(q); //querySnapshot に取得したデータを格納
      const fetchedLearnings = querySnapshot.docs.map(
        (doc) =>
          ({
            //querySnapshotに格納されたデータをmapメソッドで展開し、dod.data()に格納。
            ...doc.data(),
            id: doc.id,
          } as StudyData)
      ); // Firebaseから取得したデータは型情報がないため、`StudyData`型に明示的に変換
      setLearnings(fetchedLearnings); // 先に処理したfetchedLearningsを、setLearningsで、learningsに`StudyData`型でセット
    } catch (error) {
      console.error("Error getting documents: ", error);
    } finally {
      setLoading(false);
    }
  }, []); //依存する外部変数があれば個の配列に追加する

  //Firestoreデータ更新
  const updateDb = async (data: StudyData) => {
    setLoading(true);
    try {
      const userDocumentRef = doc(db, "users_learnings", data.id); //docで対象ドキュメントの参照を作成、db(firestore)上のusers_learningsコレクションからdata.idのドキュメントを指定して、そのフィールドを更新する
      await updateDoc(userDocumentRef, {
        //updateDocで更新ドキュメントを作成し、userDocumentRefに入っているtitleとtimeを更新する
        title: data.title,
        time: data.time,
      });
      toast({
        title: "データ更新が完了しました",
        position: "top",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.log(error);
      toast({
        title: "データ更新に失敗しました",
        description: `${error}`,
        position: "top",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  //Firestoreデータ新規登録
  const entryDb = async (data: StudyData) => {
    setLoading(true);
    try {
      const usersCollectionRef = collection(db, "users_learnings");
      const documentRef = await addDoc(usersCollectionRef, {
        title: data.title,
        time: data.time,
        email: email,
      });
      console.log(documentRef, data);
      toast({
        title: "データ登録が完了しました",
        position: "top",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error adding document: ", error);
      toast({
        title: "データ登録に失敗しました",
        description: `${error}`,
        position: "top",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  //Firestoreデータ削除
  const deleteDb = async (data: StudyData) => {
    setLoading(true);
    try {
      const userDocumentRef = doc(db, "users_learnings", data.id); //新規登録は１から作るからcollectionref、削除、更新などは既存ドキュメントを参照するからdocumentref
      await deleteDoc(userDocumentRef);
      toast({
        title: "データを削除しました",
        position: "top",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error during delete: ", error);
      toast({
        title: "データ削除に失敗しました",
        description: `${error}`,
        position: "top",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  //ログアウト処理
  const handleLogout = async () => {
    setLoading(true);
    try {
      const userLogout = await auth.signOut();
      console.log("User Logout:", userLogout);
      toast({
        title: "ログアウトしました",
        position: "top",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
      navigate("/login");
    } catch (error) {
      console.error("Error during logout:", error);
      toast({
        title: "ログアウトに失敗しました",
        position: "top",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  //サインアップ処理
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== passwordConf) {
      toast({
        title: "パスワードが一致しません",
        position: "top",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
      return;
    } else if (password.length < 6) {
      toast({
        title: "パスワードは六文字以上にして下さい",
        position: "top",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    try {
      //上記のパスワードチェックがクリアされれば実行される処理
      setLoading(true);
      //Firebaseにユーザーを作製する処理

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log("User created", userCredential);
      toast({
        title: "ユーザー登録が完了しました",
        position: "top",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
      navigate("/");
    } catch (error) {
      console.error("Error during sign up:", error);
      toast({
        title: "サインアップに失敗しました",
        description: `${error}`,
        position: "top",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  //パスワード変更
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== passwordConf) {
      toast({
        title: "パスワードが一致しません",
        position: "top",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
      return;
    } else if (password.length < 6) {
      toast({
        title: "パスワードは6文字以上にしてください",
        position: "top",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
      return;
    }
    try {
      //パスワードの更新はユーザの再認証が必要
      setLoading(true);
      if (user) {
        //再認証のために、ユーザーの認証情報を取得(credentialは資格情報という意味の英語)
        const credential = EmailAuthProvider.credential(
          user.email!, //emai情報を取得、型としてはnullの可能性がある為、末尾に!を付与。「!」はnullでは無いということを強制的に宣言するもの。
          currentPassword //現在のパスワードを入力
        );

        //再認証処理
        await reauthenticateWithCredential(user, credential);

        //パスワードの更新処理
        await updatePassword(user, password);
        toast({
          title: "パスワード更新が完了しました",
          position: "top",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
        navigate("/"); //パスワードの更新に成功したときのみページ遷移
      }
    } catch (error) {
      console.error("Error during password reset:", error);

      //chatGPTで聞いて書き方を変更
      if (error instanceof Error) {
        // 通常の Error オブジェクトなら .message が使える
        toast({
          title: "パスワード更新に失敗しました",
          description: error.message,
          position: "top",
          status: "error",
          duration: 4000,
          isClosable: true,
        });
      } else {
        //なにか別のthrow (文字列やオブジェクトなど) が来た場合のフォールバック
        toast({
          title: "パスワード更新に失敗しました",
          description: String(error),
          position: "top",
          status: "error",
          duration: 4000,
          isClosable: true,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  //パスワードリセット申請
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault(); //submitイベントの本来の動作を抑止
    try {
      //パスワードリセットメール送信
      await sendPasswordResetEmail(auth, email);
      toast({
        //正常終了でメッ成功セージを表示
        title: "パスワード設定メールを確認してください",
        position: "top",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
      navigate("/login"); //sendPasswordResetEmailが成功したときのみページ遷移
    } catch (error) {
      console.error("Error during password reset:", error);

      if (error instanceof Error) {
        toast({
          title: "パスワードの更新に失敗しました",
          description: error.message,
          position: "top",
          status: "error",
          duration: 2000,
          isClosable: true,
        });
      } else {
        toast({
          title: "パスワードの更新に失敗しました",
          description: String(error),
          position: "top",
          status: "error",
          duration: 2000,
          isClosable: true,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  ////others
  //学習時間合計
  const calculateTotalTime = () => {
    return learnings.reduce((total, learning) => total + learning.time, 0);
  };

  //追加したstateや関数をオブジェクトに追加する
  return {
    loading,
    setLoading,
    email,
    setEmail,
    password,
    setPassword,
    handleLogin,
    user,
    setUser,
    learnings,
    setLearnings,
    fetchDb,
    calculateTotalTime,
    updateDb,
    entryDb,
    deleteDb,
    handleLogout,
    passwordConf,
    setPasswordConf,
    handleSignup,
    currentPassword,
    setCurrentPassword,
    handleUpdatePassword,
    handleResetPassword,
  };
};
