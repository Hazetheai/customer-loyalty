import React, { useState } from "react";
import {
  Button,
  Card,
  Form,
  FormLayout,
  Layout,
  Page,
  Stack,
  TextField,
  SettingToggle,
  TextStyle,
} from "@shopify/polaris";

const AnnotatedLayout = () => {
  const [discount, setDiscount] = useState({ discount: "10%" });
  const [enabled, setEnabled] = useState(false);

  const contentStatus = enabled ? "Disable" : "Enable";
  const textStatus = enabled ? "enabled" : "disabled";

  function handleSubmit() {
    setDiscount(discount);
    console.log("submission", discount);
  }

  function handleChange(field) {
    console.log("field", field);
    return (value) => {
      console.log("value", value);
      setDiscount({ [field]: value });
    };
  }
  function handleToggle() {
    setEnabled(!enabled);
  }

  return (
    <Page>
      <Layout>
        <Layout.AnnotatedSection
          title="Price updates"
          description="Temporarily disable all Sample App price updates"
        >
          <Card sectioned>
            <Form onSubmit={handleSubmit}>
              <FormLayout>
                <TextField
                  value={discount.discount}
                  onChange={handleChange("discount")}
                  label="Discount percentage"
                  type="discount"
                />
                <Stack distribution="trailing">
                  <Button primary submit>
                    Save
                  </Button>
                </Stack>
              </FormLayout>
            </Form>
          </Card>
        </Layout.AnnotatedSection>
        <Layout.AnnotatedSection
          title="Price updates"
          description="Temporarily disable all Sample App price updates"
        >
          <SettingToggle
            action={{
              content: contentStatus,
              onAction: handleToggle,
            }}
            enabled={enabled}
          >
            This setting is{" "}
            <TextStyle variation="strong">{textStatus}</TextStyle>.
          </SettingToggle>
        </Layout.AnnotatedSection>
      </Layout>
    </Page>
  );
};

export default AnnotatedLayout;
