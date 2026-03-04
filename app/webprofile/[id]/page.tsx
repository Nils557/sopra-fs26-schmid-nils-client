"use client";

import { useParams, useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { User } from "@/types/user";
import { Button, Card, Spin, Descriptions, Tag } from "antd";
import React, { useEffect, useState } from "react";

const Profile: React.FC = () => {
  const router = useRouter();
  const apiService = useApi();
  const { id } = useParams(); //extracts {id} from URL

  const [user, setUser] = useState<User | null>(null); //the found user, null = not loaded yet
  const [loading, setLoading] = useState<boolean>(true);  //tracks if data is still being fetched
  const [isClient, setIsClient] = useState(false); //tracks if we're in the browser

  //confirm we're in the browser
  useEffect(() => {
    setIsClient(true);
  }, []); //[] -> runs once

  //check if user is logged in
  useEffect(() => {
    if (isClient) {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
      }
    }
  }, [isClient, router]); //rerun if isClinent or router are changed and at start

  //fetch all users and find the one matching the URL id
  useEffect(() => {
    const fetchAndFilterUser = async () => {
      try {
        setLoading(true); // show loading state while fetching

        //GET /users -> fetch ALL users
        const response = await apiService.get<User[]>("/users");

        //Find the user whose id matches the id from the URL
        //.toString() bc url needs str no int
        const foundUser = response.data.find((u: User) => u.id?.toString() === id);

        if (foundUser) {
          setUser(foundUser); // user found -> store in state
        } else {
          console.error("Error while loading the profile");
        }
      } catch (error) {
        console.error("Error", error);
      } finally {
        setLoading(false); //stop loading, after success or failure
      }
    };

    //Only fetch if: URL has an id AND we're in the browser AND user is logged in
    if (id && isClient && localStorage.getItem("token")) {
      fetchAndFilterUser();
    }
  }, [id, apiService, isClient]); //rerun if any of those is changed

  //show spinner while loading
  if (!isClient || (isClient && !localStorage.getItem("token"))) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '100px' }}>
        <Spin size="large" tip="Verifying access..." />
      </div>
    );
  }

  //handles inconsistent field names from backend
  const userData = user as unknown as Record<string, string | undefined>;
  const dateString = userData?.creation_date || user?.creationDate; //check both (I mixed it up in the backend)

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
                {dateString 
                  ? new Date(dateString).toLocaleString("de-DE") 
                  : "No date"}
              </Descriptions.Item>

              <Descriptions.Item label="Bio">
                {user.bio}
              </Descriptions.Item>
            </Descriptions>
            <div style={{ marginTop: 20 }}></div>
          </>
        ) : (
          // Only show "not found" message after loading is complete
          !loading && <p>User with {id} could not be found.</p>
        )}
      </Card>
    </div>
  );
};

export default Profile;