import { Layout as LayoutANTD, theme } from "antd";
import React, { ReactNode } from "react";
import { useRouter } from "next/router";
import { ROUTE } from "@/constant/route";
import Footer from "./Footer";
import HeaderNav from "./HeaderNav";
import Head from "next/head";
import Image from "next/image";

const { Header, Content } = LayoutANTD;

const layoutStyle: React.CSSProperties = {
    minHeight: "100vh",
};

export default function PublicLayout({ children }: Props) {
    const router = useRouter();
    const {
        token: { colorBgContainer },
    } = theme.useToken();

    return (
        <>
            <Head>
                <title>Open Data Peta Wisata Indonesia</title>
                <meta
                    name="description"
                    content="Jelajahi keindahan Indonesia dengan mudah! Aplikasi Peta Wisata Open Data ini memungkinkan kamu mencari dan menemukan berbagai tempat wisata menarik di seluruh Nusantara."
                />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                <meta name="dicoding:email" content="alfadila.anas@gmail.com" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <LayoutANTD style={layoutStyle}>
                <Header
                    style={{ paddingInline: "16px" }}
                    id="public-layout-header"
                >
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                        }}
                    >
                        <div
                            className="logo"
                            style={{
                                textAlign: "center",
                                fontWeight: "bold",
                                cursor: "pointer",
                                display: "flex",
                                marginRight: "12px",
                            }}
                            onClick={(e) => {
                                e.preventDefault();
                                router.push(ROUTE.HOME.URL);
                            }}
                        >
                            <Image
                                src="/logo.png"
                                alt="logo"
                                width={80}
                                height={36}
                                style={{
                                    margin: "auto 4px auto 12px",
                                }}
                            />
                            <span
                                style={{
                                    color: "whitesmoke",
                                    opacity: "85%",
                                }}
                            >
                                Open Data Peta Wisata Indonesia
                            </span>
                        </div>
                        <HeaderNav />
                    </div>
                </Header>
                <Content
                    style={{
                        background: colorBgContainer,
                    }}
                >
                    {children}
                </Content>
                <Footer />
            </LayoutANTD>
        </>
    );
}

interface Props {
    children?: ReactNode;
}
