import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useDropzone } from "react-dropzone";
import { v4 as uuidv4 } from "uuid";

const BASE_URL = "http://localhost:5000"; // Tạm dùng cho local

function RoomFormModal({ onClose, onSubmit, initialData }) {
  const [form, setForm] = useState({
    roomName: "",
    description: "",
    roomType: "standard",
    amenities: "",
    status: "available",
    priceDay: 0,
    priceNight: 0,
    sliderImage: null,
    thumbImages: [],
  });

  const [sliderPreview, setSliderPreview] = useState(null);
  const [thumbImagesPreview, setThumbImagesPreview] = useState([]);

  useEffect(() => {
    if (initialData) {
      setForm({
        ...initialData,
        amenities: initialData.amenities?.join(", ") || "",
        sliderImage: null,
        thumbImages: [],
      });

      const sliderUrl = initialData.imageUrls?.[0]
        ? `${BASE_URL}${initialData.imageUrls[0]}`
        : null;
      const thumbUrls = initialData.imageUrls?.slice(1)?.map((url) => `${BASE_URL}${url}`) || [];

      setSliderPreview(sliderUrl);
      setThumbImagesPreview(thumbUrls);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSliderChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm((prev) => ({ ...prev, sliderImage: file }));
      setSliderPreview(URL.createObjectURL(file));
    }
  };

  const onDropThumbs = (acceptedFiles) => {
    const newThumbs = acceptedFiles.map((file) => ({
      id: uuidv4(),
      file,
      preview: URL.createObjectURL(file),
    }));
    setForm((prev) => ({
      ...prev,
      thumbImages: [...prev.thumbImages, ...newThumbs],
    }));
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: onDropThumbs,
    accept: { "image/*": [] },
  });

  const handleSubmit = () => {
    if (!form.roomName || !form.priceDay || !form.priceNight) {
      toast.error("Vui lòng nhập đầy đủ tên phòng, giá ngày và giá đêm.");
      return;
    }

    if (!initialData && !form.sliderImage) {
      toast.error("Vui lòng chọn ảnh slider cho phòng.");
      return;
    }

    const amenitiesArray = form.amenities
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const formData = new FormData();
    formData.append("roomName", form.roomName);
    formData.append("description", form.description);
    formData.append("roomType", form.roomType);
    formData.append("status", form.status);
    formData.append("priceDay", form.priceDay);
    formData.append("priceNight", form.priceNight);
    formData.append("amenities", amenitiesArray.join(","));

    if (form.sliderImage) {
      formData.append("sliderImage", form.sliderImage);
    }

    form.thumbImages.forEach((img) => {
      formData.append("thumbImages", img.file);
    });

    // Loại bỏ BASE_URL khỏi các URL để backend xử lý
    const cleanThumbs = thumbImagesPreview.map((url) =>
      url.replace(BASE_URL, "")
    );
    formData.append("oldThumbs", cleanThumbs.join(","));

    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-2xl shadow w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">
          {initialData ? "Chỉnh sửa phòng" : "Thêm phòng mới"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            name="roomName"
            value={form.roomName}
            onChange={handleChange}
            placeholder="Tên phòng"
            className="border p-2 rounded"
          />
          <select
            name="roomType"
            value={form.roomType}
            onChange={handleChange}
            className="border p-2 rounded"
          >
            <option value="standard">Standard</option>
            <option value="deluxe">Deluxe</option>
          </select>
          <input
            type="number"
            name="priceDay"
            value={form.priceDay}
            onChange={handleChange}
            placeholder="Giá ban ngày"
            className="border p-2 rounded"
          />
          <input
            type="number"
            name="priceNight"
            value={form.priceNight}
            onChange={handleChange}
            placeholder="Giá ban đêm"
            className="border p-2 rounded"
          />
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Mô tả"
            className="border p-2 rounded col-span-2"
          />
          <input
            type="text"
            name="amenities"
            value={form.amenities}
            onChange={handleChange}
            placeholder="Tiện ích (phân cách bằng dấu phẩy)"
            className="border p-2 rounded col-span-2"
          />
        </div>

        <div className="mt-4">
          <label className="block font-medium mb-1">Trạng thái</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="border p-2 rounded"
          >
            <option value="available">Sẵn sàng</option>
            <option value="unavailable">Ngừng đặt</option>
          </select>
        </div>

        <div className="mt-4">
          <label className="block font-medium mb-1">Ảnh slider (chính):</label>
          {sliderPreview && (
            <img
              src={sliderPreview}
              alt="slider"
              className="h-24 object-cover rounded mb-2"
            />
          )}
          <input type="file" accept="image/*" onChange={handleSliderChange} />
        </div>

        <div className="mt-4">
          <label className="block font-medium mb-1">Ảnh thumb (nhiều ảnh):</label>
          <div
            {...getRootProps()}
            className="border border-dashed p-4 rounded-md cursor-pointer bg-gray-50 hover:bg-gray-100 text-center"
          >
            <input {...getInputProps()} />
            <p>Kéo thả ảnh hoặc click để chọn</p>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-4 gap-3 mt-3">
            {thumbImagesPreview.map((url, idx) => (
              <div
                key={"old-" + idx}
                className="relative border rounded overflow-hidden group"
              >
                <img
                  src={url}
                  alt={`old-thumb-${idx}`}
                  className="w-full h-24 object-cover"
                />
                <button
                  type="button"
                  onClick={() =>
                    setThumbImagesPreview((prev) =>
                      prev.filter((item) => item !== url)
                    )
                  }
                  className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 text-xs opacity-0 group-hover:opacity-100 transition"
                >
                  X
                </button>
              </div>
            ))}

            {form.thumbImages.map((img, idx) => (
              <div
                key={img.id}
                className="relative border rounded overflow-hidden group"
              >
                <img
                  src={img.preview}
                  alt={`new-thumb-${idx}`}
                  className="w-full h-24 object-cover"
                />
                <button
                  type="button"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      thumbImages: prev.thumbImages.filter((t) => t.id !== img.id),
                    }))
                  }
                  className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 text-xs opacity-0 group-hover:opacity-100 transition"
                >
                  X
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            onClick={onClose}
          >
            Hủy
          </button>
          <button
            type="button"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={handleSubmit}
          >
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
}

export default RoomFormModal;
