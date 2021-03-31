import { ResourcePicker, TitleBar } from "@shopify/app-bridge-react";
import { EmptyState, Layout, Page } from "@shopify/polaris";
import { useState } from "react";
import store from "store-js";
import ResourceListWithProducts from "../components/ResourceList";

const img = "https://cdn.shopify.com/s/files/1/0757/9955/files/empty-state.svg";

const Index = () => {
  const [resPickOpen, setResPickOpen] = useState(false);

  function handleSelection(resources) {
    const idsFromResources = resources.selection.map((product) => product.id);
    setResPickOpen(false);
    console.log(idsFromResources);
    store.set("ids", idsFromResources);
  }
  const emptyState = !store.get("ids");
  return (
    <Page>
      <TitleBar
        title="Sample App"
        primaryAction={{
          content: "Select products",
          onAction: () => setResPickOpen(true),
        }}
      />
      <ResourcePicker
        resourceType="Product"
        showVariants={false}
        open={resPickOpen}
        onSelection={(resources) => handleSelection(resources)}
        onCancel={() => setResPickOpen(false)}
      />
      {emptyState ? (
        <Layout>
          <EmptyState
            heading="Discount your products temporarily"
            action={{
              content: "Select products",
              onAction: () => setResPickOpen(true),
            }}
            image={img}
          >
            <p>Select products to change their price temporarily.</p>
          </EmptyState>
        </Layout>
      ) : (
        <ResourceListWithProducts />
      )}
    </Page>
  );
};

export default Index;
