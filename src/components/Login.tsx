import {
  Flex,
  Card,
  CardBody,
  Heading,
  Input,
  InputGroup,
  InputLeftElement,
  Box,
  Button,
  Stack,
} from "@chakra-ui/react";

import { FaUserCheck } from "react-icons/fa"; //ユーザーアイコンのインポート
import { RiLockPasswordFill } from "react-icons/ri"; //パスワードアイコンのインポート
import { useFirebase } from "../hooks/useFirebase"; //カスタムフックのインポート
import { useNavigate } from "react-router-dom";

const Login = () => {
  const { loading, email, setEmail, password, setPassword, handleLogin } =
    useFirebase(); //カスタムフックuseFIrebaseの定義
  const navigate = useNavigate();

  return (
    <Flex justifyContent={"center"} boxSize={"fit-content"} mx={"auto"} p={5}>
      <Card size={{ base: "sm", md: "lg" }} p={4}>
        <Heading size={"md"} textAlign={"center"}>
          ログイン
        </Heading>
        <CardBody>
          <form
            onSubmit={handleLogin} //Form,submit時,useFIrebaseによるhandleLogin実行
          >
            <InputGroup>
              <InputLeftElement
                pointerEvents={"none"} //inputの左にあるアイコンのこと
              >
                <FaUserCheck color="gray" />
              </InputLeftElement>
              <Input
                autoFocus //自動でフォーカスを当てる
                type="email" //メールアドレスとして正しいか判定、ブラウザの標準機能でバリデーションが働く
                placeholder="メールアドレスを入力"
                name="email"
                value={email} //value追加
                required //入力を必須にする
                mb={2}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEmail(e.target.value)
                } //Inputフィールドに入力された値をsetEmailでemailステートに格納
              />
            </InputGroup>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <RiLockPasswordFill color="gray" />
              </InputLeftElement>
              <Input
                type="password"
                placeholder="パスワードを入力"
                name="password"
                value={password}
                required //入力を必須にする
                mb={2}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPassword(e.target.value)
                } //Inputフィールドに入力された値をsetPasswordでpasswordステートに格納
              />
            </InputGroup>
            <Box mt={4} mb={2} textAlign="center">
              <Button
                isLoading={loading} //ローディング状態をuseFirebaseより取得し、ローディング中はスピナーを表示
                loadingText="Loading"
                spinnerPlacement="start"
                type="submit" //ログインボタンにのみsubmitを定義しているため、新規登録ボタンではバリデーションは働かない。
                colorScheme="green"
                width="100%"
                mb={2}
              >
                ログイン
              </Button>
              <Button
                colorScheme="green"
                width="100%"
                variant="outline"
                onClick={() => navigate("/register")} //クリックしたら/registerに遷移
              >
                新規登録
              </Button>
            </Box>

            <Stack spacing={3}>
              <Button
                colorScheme="green"
                width="100%"
                variant="ghost"
                onClick={() => navigate("/sendReset")}
              >
                パスワードをお忘れですか？
              </Button>
            </Stack>
          </form>
        </CardBody>
      </Card>
    </Flex>
  );
};

export default Login;
