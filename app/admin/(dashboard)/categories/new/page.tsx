import React from "react";
import CategoryForm from "../CategoryForm";

export default function NewCategoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add Category</h1>
        <p className="text-muted-foreground">Create a new product category</p>
      </div>
      <CategoryForm />
    </div>
  );
}
