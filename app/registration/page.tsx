"use client";

import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { Button, Form, Input } from "antd";
import { User } from "@/types/user";


// Defines the shape of the form fields(optional with "?", none of them are required to be filled in at the Type level)
interface FormFieldProps {
  username?: string;
  password?: string;
  bio?: string;
}

const Register: React.FC = () => {
  const router = useRouter(); //for redirecting after registration
  const apiService = useApi();
  const [form] = Form.useForm();
  
  //setts token and id to local storage
  const { set: setToken } = useLocalStorage<string>("token", "");
  const { set: setUserId } = useLocalStorage<string>("userId", "");

  const handleRegistration = async (values: FormFieldProps) => {
    try {
      //POST to "/users" with form values (username, password, bio), a User Object is expected as response value
      const response = await apiService.post<User>("/users", values);
      //Safely read the Authorization token from response headers
      //"?." = optional chaining, won't crash if headers is null/undefined
      const token = response.headers?.get("Authorization");

      //If token exists, save it to localStorage via the custom hook
      if (token) {
        setToken(token);
      } 
      
      //If the response contains a user ID, save it and redirect to profile page
      //"?." = safely access .id without crashing if response.data is null
      if (response.data?.id) {
        setUserId(response.data.id.toString());
        router.push('/users/' + response.data.id);
      }
    } catch (error) {
      if (error instanceof Error) {
        alert(`Something went wrong during the registration:\n${error.message}`);
      }
    }
  };

  return (
    <div className="login-container">
      <Form
        form={form}
        name="register"
        size="large"
        variant="outlined"
        onFinish={handleRegistration}
        layout="vertical"
      >
        <Form.Item
          name="username"
          label="Username"
          rules={[
            { required: true, message: "Please input your username!" },
            { whitespace: true, message: "Username cannot be empty." }
          ]}
        >
          <Input placeholder="Enter username" />
        </Form.Item>

        <Form.Item
          name="password"
          label="Password"
          rules={[
            { required: true, message: "Please input your password!" },
            { whitespace: true, message: "Password cannot be empty spaces!" }
          ]}
        >
          <Input.Password placeholder="Enter password" />
        </Form.Item>

        <Form.Item
          name="bio"
          label="Bio"
          rules={[
            { required: true, message: "Please input your Bio!" },
            { whitespace: true, message: "Bio cannot be empty spaces!" },
            { max: 200, message: "Bio is too long (max 200 characters)." }
          ]}
        >
          <Input.TextArea 
            placeholder="Tell us a bit about yourself..." 
            showCount 
            maxLength={200} 
            autoSize={{ minRows: 3, maxRows: 6 }} 
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" className="login-button">
            register
          </Button>
        </Form.Item>

        <Form.Item>
          <Button type="default" className="grey-button" onClick={() => router.push("/login")}>
            login
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Register;