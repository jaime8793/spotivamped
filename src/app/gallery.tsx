export default function Gallery() {
  const images = [
    "https://utfs.io/f/36966936-08d2-4da6-8a49-bb834cafe84e-vzmx8a.png",
    "https://utfs.io/f/9934863b-e798-4146-bc40-1544a00cbd35-bvsy1m.jpg",
    "https://utfs.io/f/9934863b-e798-4146-bc40-1544a00cbd35-bvsy1m.jpg",
    "https://utfs.io/f/c039ed8d-cc46-4c9f-be23-80dd3989273a-jxqiz0.jpg",
  ];
  return (
    <div>
      <h1>Gallery</h1>
      <div className="flex flex-wrap gap-3">
        {[...images, ...images, ...images].map((image) => (
          <img key={image} src={image} className="w-48" />
        ))}
      </div>
    </div>
  );
}
