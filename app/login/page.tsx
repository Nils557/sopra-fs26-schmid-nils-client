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
    // value: token, // is commented out because we do not need the token value
    set: setToken, // we need this method to set the value of the token to the one we receive from the POST request to the backend server API
    // clear: clearToken, // is commented out because we do not need to clear the token when logging in
  } = useLocalStorage<string>("token", ""); // note that the key we are selecting is "token" and the default value we are setting is an empty string
  // if you want to pick a different token, i.e "usertoken", the line above would look as follows: } = useLocalStorage<string>("usertoken", "");
  const { set: setUserId} = useLocalStorage<string>("userId", "");


  const handleLogin = async (values: FormFieldProps) => {
    //try catch if any server errors happen
      try {
        //Send a POST request to "/login" with the form values (username + password), <User> = responsedata will be shaped like a user
        const response = await apiService.post<User>("/login", values);
        //Extract the auth token from the response headers (Authorization: "abc123")
        const token = response.headers.get("Authorization");
        //Extract the user's ID from the response body
        const userId = (response.data as User).id;

        //Only proceed if token AND userId were received
        if (token && userId) {
          //Set token and userId in localStorage (so PageRefreshes don't delete them)
          localStorage.setItem("token", token);
          localStorage.setItem("userId", userId.toString());

          //Update global app state so other components know the user is logged in
          setToken(token);
          setUserId(userId.toString());

          console.log("Login done, Token saved!"); //for testing
          router.push("/users/" + userId);
        } else {
          alert("Login failed: Server has not sent a Token or an ID.");
        }
        //catch any other failure
      } catch (error) {
        if (error instanceof Error) {
          alert(`Something went wrong during the login:\n${error.message}`);
        }
      }
    };

  return (
    <div className="login-container">
      <Form
        form={form}
        name="login"
        size="large"
        variant="outlined"
        onFinish={handleLogin}
        layout="vertical"
      >
        <Form.Item
          name="username"
          label="Username"
          rules={[{ required: true, message: "Please input your username!" }]}
        >
          <Input placeholder="Enter username" />
        </Form.Item>
        <Form.Item
          name="password"
          label="Password"
          rules={[{ required: true, message: "Password is reqired!" }]}
        >
          <Input.Password placeholder="Enter password" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" className="login-button">
            Login
          </Button>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="button" className="grey-button" onClick={() => router.push("/registration")}>
            Register
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Login;