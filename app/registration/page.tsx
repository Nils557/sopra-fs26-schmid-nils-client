"use client";

import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { Button, Form, Input } from "antd";

interface FormFieldProps {
  label: string;
  value: string;
}

const Register: React.FC = () => {
  const router = useRouter();
  const apiService = useApi();
  const [form] = Form.useForm();
  
  const { set: setToken } = useLocalStorage<string>("token", "");
  const { set: setUserId } = useLocalStorage<string>("userId", "");

  const handleRegistration = async (values: FormFieldProps) => {
    try {
      const response = await apiService.post<any>("/users", values);
      const token = response.headers?.get("Authorization");

      if (token) {
        setToken(token);
        console.log("Token gespeichert:", token);
      } else {
        console.warn("Kein Token im Header gefunden!");
      }
      
      if (response.data?.id) {
        setUserId(response.data.id.toString());
        router.push('/users/' + response.data.id);
      } else {
        console.error("Keine ID in response.data gefunden:", response);
      }
    } catch (error) {
      if (error instanceof Error) {
        alert(`Something went wrong during the registration:\n${error.message}`);
      } else {
        console.error("An unknown error occurred during registration.");
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
          rules={[{ required: true, message: "Please input your username!" },
            {whitespace: true, message: "Username can not be empty."}
          ]}
        >
          <Input placeholder="Enter username" />
        </Form.Item>
        <Form.Item
          name="password"
          label="Password"
          rules={[{required: true, message: "Please input your password!" },
            {whitespace: true, message: "password can not be emptyspaces!"}
          ]}
        >
          <Input.Password placeholder="Enter password" />
        </Form.Item>
        <Form.Item
          name="bio"
          label="Bio"
          rules={[{required: true, message: "Please input your Bio!" },
            {whitespace: true, message: "Bio can not be emptyspaces!"},
            {max: 200, message: "Bio is to long. (max 200 characters)" }]}
        >
          <Input.TextArea placeholder="Tell us a bit about yourself..." showCount maxLength={200} autoSize={{ minRows: 3, maxRows: 6 }} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" className="login-button">
            register
          </Button>
        </Form.Item>
        <Form.Item>
          <Button type="primary" className="grey-button" onClick={() => router.push("/login")}>
            login
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Register;