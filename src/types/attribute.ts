export interface Attribute {
  id: number;
  attribute_title: string;
  // Only present on GET /:id, not on list/create/update responses.
  attributeItems?: AttributeItem[];
}

export interface AttributeItem {
  id: number;
  title: string;
  attribute_id: number;
  order_by: number | null;
  image: string | null;
}

export interface AttributeFormValues {
  attribute_title: string;
}

export interface AttributeItemFormValues {
  title: string;
  attribute_id: number;
  order_by?: number;
}
