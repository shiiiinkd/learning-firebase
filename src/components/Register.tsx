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
  Text,
} from "@chakra-ui/react";

import { FaUserCheck } from "react-icons/fa"; //ユーザーアイコンのインポート
import { RiLockPasswordFill } from "react-icons/ri"; //パスワードアイコンのインポート
import { useFirebase } from "../hooks/useFirebase"; //カスタムフックのインポート

const Register = () => {
  const {
    loading,
    email,
    setEmail,
    password,
    setPassword,
    passwordConf,
    setPasswordConf,
    handleSignup,
  } = useFirebase(); //カスタムフックuseFIrebaseの定義

  return (
    <Flex justifyContent={"center"} boxSize={"fit-content"} mx={"auto"} p={5}>
      <Card size={{ base: "sm", md: "lg" }} p={4}>
        <Heading size={"md"} textAlign={"center"}>
          ユーザー登録
        </Heading>
        <CardBody>
          <form onSubmit={handleSignup}>
            {/*formサブミットでサインアップ処理するuseFirebaseのhandleSignupを実行する */}
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
                onChange={(e) => setEmail(e.target.value)} //Inputフィールドに入力された値をsetEmailでemailステートに格納
              />
            </InputGroup>
            <Text fontSize="12px" color="gray">
              パスワードは６文字以上
            </Text>
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
                onChange={(e) => setPassword(e.target.value)} //Inputフィールドに入力された値をsetPasswordでpasswordステートに格納
              />
            </InputGroup>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <RiLockPasswordFill color="gray" />
              </InputLeftElement>
              <Input
                type="password"
                placeholder="パスワードを入力(確認)"
                name="passwordConf"
                value={passwordConf}
                required
                mb={2}
                onChange={(e) => setPasswordConf(e.target.value)}
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
                登録する
              </Button>
              <Button
                colorScheme="gray"
                width="100%"
                onClick={() => window.history.back()} //JavaScriptのwindow.history.backで前のURL(前のページ)に戻る処理を記述
              >
                戻る
              </Button>
            </Box>
            <Box mt={4} mb={2} textAlign="center">
              <Stack spacing={3}>
                <Button
                  colorScheme="green"
                  width="100%"
                  variant="ghost"
                  onClick={() => {}}
                >
                  パスワードをお忘れですか？
                </Button>
              </Stack>
            </Box>
          </form>
        </CardBody>
      </Card>
    </Flex>
  );
};

export default Register;
