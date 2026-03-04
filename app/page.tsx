"use client"; // For components that need React hooks and browser APIs, SSR (server side rendering) has to be disabled. Read more here: https://nextjs.org/docs/pages/building-your-application/rendering/server-side-rendering
import { useRouter } from "next/navigation"; // use NextJS router for navigation
import { Button, Form } from "antd";


export default function Home() {
  const router = useRouter();
  const [form] = Form.useForm();
  return (
    <div className="login-container">
      <Form
        form={form}
        name="login"
        size="large"
        variant="outlined"
        layout="vertical"
      > <Form.Item>
        <li>
          <h1>
            Sopra 2026
          </h1>
        </li>
        <li>
          Nils Schmid / 24-700-502
        </li>
      </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" className="login-button" onClick={() => router.push("/login")}>
            Login
          </Button>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="button" className="login-button" onClick={() => router.push("/registration")}>
            Register
          </Button>
        </Form.Item>      
        <Form.Item>
        <li>
          Frontend: https://sopra-fs26-schmid-nils-client.vercel.app/
        </li>
        <li>
          Backend: https://sopra-fs26-schmid-nils-server.oa.r.appspot.com/
        </li>
      </Form.Item>
      </Form>
    </div>
  );
}
