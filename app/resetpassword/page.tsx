"use client"; // For components that need React hooks and browser APIs, SSR (server side rendering) has to be disabled. Read more here: https://nextjs.org/docs/pages/building-your-application/rendering/server-side-rendering

import { useRouter } from "next/navigation"; // use NextJS router for navigation
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { User } from "@/types/user";
import { Button, Form, Input } from "antd";
// Optionally, you can import a CSS module or file for additional styling:
// import styles from "@/styles/page.module.css";

interface FormFieldProps {
  label: string;
  value: string;
}

const Login: React.FC = () => {
  const router = useRouter();
  const apiService = useApi();
  const [form] = Form.useForm();
  // useLocalStorage hook example use
  // The hook returns an object with the value and two functions
  // Simply choose what you need from the hook:
  const {
    value: token, // is commented out because we do not need the token value
  } = useLocalStorage<string>("token", ""); // note that the key we are selecting is "token" and the default value we are setting is an empty string
  // if you want to pick a different token, i.e "usertoken", the line above would look as follows: } = useLocalStorage<string>("usertoken", "");
  const { set: setUserId} = useLocalStorage<string>("userId", "");

  const resetPassword = async() => {
    //check if token matches changing id
    //check if fields match -> reset in backend
  }



  return (
    <div className="login-container">
      <Form
        form={form}
        name="login"
        size="large"
        variant="outlined"
        onFinish={resetPassword}
        layout="vertical"
      >
        <Form.Item
          name="npassword"
          label="New password"
          rules={[{ required: true, message: "Please input your new password!" }]}
        >
          <Input placeholder="Enter new password" />
        </Form.Item>
        <Form.Item
          name="repeat_password"
          label="Repeat new password"
          rules={[{ required: true, message: "Pleaes repeat your password" }]}
        >
          <Input.Password placeholder="Enter password" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" className="login-button">
            Reset
          </Button>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" className="grey-button" onClick={() => router.push("/registration")}>
            Back
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Login;
