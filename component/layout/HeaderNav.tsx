import { ROUTE } from "@/constant/route";
import { Button, Dropdown, Menu } from "antd";
import { useRouter } from "next/router";
import { MenuOutlined } from "@ant-design/icons";
import classes from "./HeaderNav.module.css";

const headerMenu = [
    {
        key: ROUTE.DOWNLOAD_DATA.URL,
        label: ROUTE.DOWNLOAD_DATA.TITLE,
    },
];

export default function HeaderNav() {
    const router = useRouter();
    return (
        <>
            <Menu
                theme="dark"
                mode="horizontal"
                style={{ minWidth: 0, flex: "auto" }}
                selectedKeys={[router.pathname]}
                items={headerMenu.map((item) => {
                    return {
                        ...item,
                        onClick: () => router.push(item.key),
                    };
                })}
                className={classes.menu_nav}
            />

            <Dropdown
                menu={{
                    items: headerMenu.map((item) => {
                        return {
                            ...item,
                            onClick: () => router.push(item.key),
                            theme: "dark",
                        };
                    }),
                    selectedKeys: [router.pathname],
                }}
                placement="bottomRight"
                className={classes.menu_button}
            >
                <Button size="large" ghost style={{ margin: "auto 0" }}>
                    <MenuOutlined />
                </Button>
            </Dropdown>
        </>
    );
}
