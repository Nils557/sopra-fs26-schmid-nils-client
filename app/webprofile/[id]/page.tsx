"use client";

import { useParams, useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { User } from "@/types/user";
import { Button, Card, Spin, Descriptions, Tag } from "antd";
import React, { useEffect, useState } from "react";

const Profile: React.FC = () => {
  const router = useRouter();
  const apiService = useApi();
  const { id } = useParams();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isClient, setIsClient] = useState(false); 

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
      }
    }
  }, [isClient, router]);

  useEffect(() => {
    const fetchAndFilterUser = async () => {
      try {
        setLoading(true);
        const response = await apiService.get<User[]>("/users");
        const foundUser = response.data.find((u: User) => u.id?.toString() === id);

        if (foundUser) {
          setUser(foundUser);
        } else {
          console.error("Error while loading the profile");
        }
      } catch (error) {
        console.error("Error", error);
      } finally {
        setLoading(false);
      }
    };

    if (id && isClient && localStorage.getItem("token")) {
      fetchAndFilterUser();
    }
  }, [id, apiService, isClient]);

  if (!isClient || (isClient && !localStorage.getItem("token"))) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '100px' }}>
        <Spin size="large" tip="Verifying access..." />
      </div>
    );
  }

  const rawDate = user ? (user as any).creation_date || user.creationDate : null;

  return (
    <div className="card-container">
      <Card 
        title={user ? user.username + "'s profile" : 'Profile not found'} 
        loading={loading} 
        style={{ width: "100%", maxWidth: "800px", margin: "20px auto" }}
        extra={<Button onClick={() => router.back()}>Go Back</Button>}
      >
        {user ? (
          <>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Username">
                {user.username}
              </Descriptions.Item>
              
              <Descriptions.Item label="Status">
                <Tag color={user.status === "ONLINE" ? "green" : "red"}>
                  {user.status}
                </Tag>
              </Descriptions.Item>

              <Descriptions.Item label="Date of creation">
                {user && (user["creation_date" as keyof User] || user.creationDate)
                  ? new Date((user["creation_date" as keyof User] || user.creationDate) as string).toLocaleString("de-DE") 
                  : "No date"}
              </Descriptions.Item>

              <Descriptions.Item label="Bio">
                {user.bio}
              </Descriptions.Item>
            </Descriptions>
            <div style={{ marginTop: 20 }}></div>
          </>
        ) : (
          !loading && <p>User with {id} could not be found.</p>
        )}
      </Card>
    </div>
  );
};

export default Profile;