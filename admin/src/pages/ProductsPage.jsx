import { useState } from "react";
import {
  PlusIcon,
  PencilIcon,
  Trash2Icon,
  XIcon,
  ImageIcon,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productApi } from "../lib/api";
import { getStockStatusBadge } from "../lib/utils";

function ProductsPage() {
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    stock: "",
    description: "",
  });
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const queryClient = useQueryClient();

  // 1. Fetch data - handle nested object structure
  const { data, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: productApi.getAll,
  });

  const productList = data?.products || [];

  // 2. Mutations
  const createProductMutation = useMutation({
    mutationFn: productApi.create,
    onSuccess: () => {
      closeModal();
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: productApi.update,
    onSuccess: () => {
      closeModal();
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: productApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  // 3. Handlers
  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setFormData({
      name: "",
      category: "",
      price: "",
      stock: "",
      description: "",
    });
    // Clean up blob URLs to prevent memory leaks
    imagePreviews.forEach((url) => {
      if (url.startsWith("blob:")) URL.revokeObjectURL(url);
    });
    setImages([]);
    setImagePreviews([]);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      stock: product.stock.toString(),
      description: product.description,
    });
    setImagePreviews(product.images || []);
    setShowModal(true);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 3) return alert("Maximum 3 images allowed");

    // revoke previous blob URLs
    imagePreviews.forEach((url) => {
      if (url.startsWith("blob:")) URL.revokeObjectURL(url);
    });

    setImages(files);
    setImagePreviews(files.map((file) => URL.createObjectURL(file)));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!editingProduct && images.length === 0) {
      return alert("Please upload at least one image");
    }

    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("price", formData.price);
    formDataToSend.append("stock", formData.stock);
    formDataToSend.append("category", formData.category);

    if (images.length > 0) {
      images.forEach((image) => formDataToSend.append("images", image));
    }

    if (editingProduct) {
      updateProductMutation.mutate({
        id: editingProduct._id,
        formData: formDataToSend,
      });
    } else {
      createProductMutation.mutate(formDataToSend);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-base-content/70 mt-1">
            Manage your product inventory
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-primary gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          Add Product
        </button>
      </div>

      {/* PRODUCTS LISTING */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      ) : productList.length === 0 ? (
        <div className="text-center py-20 bg-base-100 rounded-xl border-2 border-dashed border-base-300">
          <p className="text-base-content/50">
            No products found. Add your first one!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {productList.map((product) => {
            const status = getStockStatusBadge(product.stock);
            return (
              <div
                key={product._id}
                className="card bg-base-100 shadow-xl border border-base-200"
              >
                <div className="card-body p-4 md:p-6">
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="avatar">
                      <div className="w-24 rounded-xl">
                        <img
                          src={
                            product.images?.[0] ||
                            "https://via.placeholder.com/150"
                          }
                          alt={product.name}
                          className="object-cover"
                        />
                      </div>
                    </div>

                    <div className="flex-1 w-full text-center md:text-left">
                      <div className="flex flex-col md:flex-row items-center justify-between gap-2">
                        <div>
                          <h3 className="card-title justify-center md:justify-start">
                            {product.name}
                          </h3>
                          <p className="text-base-content/70 text-sm">
                            {product.category}
                          </p>
                        </div>
                        <div className={`badge ${status.class} p-3`}>
                          {status.text}
                        </div>
                      </div>
                      <div className="flex items-center justify-center md:justify-start gap-8 mt-4">
                        <div>
                          <p className="text-xs text-base-content/70 uppercase">
                            Price
                          </p>
                          <p className="font-bold text-lg">
                            ${Number(product.price).toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-base-content/70 uppercase">
                            Stock
                          </p>
                          <p className="font-bold text-lg">
                            {product.stock} units
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="card-actions md:flex-col gap-2">
                      <button
                        className="btn btn-square btn-ghost"
                        onClick={() => handleEdit(product)}
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button
                        className="btn btn-square btn-ghost text-error"
                        onClick={() => {
                          if (
                            window.confirm(
                              "Are you sure you want to delete this product?",
                            )
                          ) {
                            deleteProductMutation.mutate(product._id);
                          }
                        }}
                      >
                        {deleteProductMutation.isPending ? (
                          <span className="loading loading-spinner loading-xs"></span>
                        ) : (
                          <Trash2Icon className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL */}
      <input
        type="checkbox"
        className="modal-toggle"
        checked={showModal}
        onChange={() => {}} // Handles the React warning
      />

      <div className="modal">
        <div className="modal-box max-w-2xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-2xl">
              {editingProduct ? "Edit Product" : "Add New Product"}
            </h3>
            <button
              onClick={closeModal}
              className="btn btn-sm btn-circle btn-ghost"
            >
              <XIcon className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Product Name</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Category</span>
                </label>
                <select
                  className="select select-bordered"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  required
                >
                  <option value="">Select category</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Sports">Sports</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Price ($)</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  className="input input-bordered"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Stock</span>
                </label>
                <input
                  type="number"
                  className="input input-bordered"
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData({ ...formData, stock: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Description</span>
              </label>
              <textarea
                className="textarea textarea-bordered h-24"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" /> Product Images (Max 3)
                </span>
              </label>

              <div className="bg-base-200 rounded-xl p-4 border-2 border-dashed border-base-300">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="file-input file-input-bordered file-input-primary w-full"
                  required={!editingProduct}
                />
              </div>

              {imagePreviews.length > 0 && (
                <div className="flex gap-4 mt-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="avatar">
                      <div className="w-20 rounded-lg ring ring-primary ring-offset-base-100 ring-offset-2">
                        <img
                          src={preview}
                          alt="Preview"
                          className="object-cover"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="modal-action">
              <button type="button" onClick={closeModal} className="btn">
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary min-w-30"
                disabled={
                  createProductMutation.isPending ||
                  updateProductMutation.isPending
                }
              >
                {createProductMutation.isPending ||
                updateProductMutation.isPending ? (
                  <span className="loading loading-spinner"></span>
                ) : editingProduct ? (
                  "Update Product"
                ) : (
                  "Add Product"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ProductsPage;
