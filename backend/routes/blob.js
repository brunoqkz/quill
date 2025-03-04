var express = require("express");
var router = express.Router();
var multer = require("multer");
var { BlobServiceClient } = require("@azure/storage-blob");
var stream = require("stream");

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Azure Blob Storage connection
const connectToAzureStorage = () => {
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  if (!connectionString) {
    throw new Error("Azure Storage connection string not found");
  }
  return BlobServiceClient.fromConnectionString(connectionString);
};

// Get container client
const getContainerClient = async (containerName) => {
  const blobServiceClient = connectToAzureStorage();
  const containerClient = blobServiceClient.getContainerClient(containerName);

  // Ensure container exists
  try {
    await containerClient.createIfNotExists();
  } catch (error) {
    console.error(`Error creating container: ${error.message}`);
    throw error;
  }

  return containerClient;
};

// Upload file to blob storage
router.post(
  "/upload/:containerName",
  upload.single("file"),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const containerName = req.params.containerName;
      const fileName = req.file.originalname;
      const containerClient = await getContainerClient(containerName);
      const blockBlobClient = containerClient.getBlockBlobClient(fileName);

      // Convert buffer to stream
      const bufferStream = new stream.PassThrough();
      bufferStream.end(req.file.buffer);

      // Upload the file
      const uploadOptions = {
        blobHTTPHeaders: {
          blobContentType: req.file.mimetype,
        },
      };

      await blockBlobClient.uploadStream(
        bufferStream,
        uploadOptions.blobHTTPHeaders.blobContentType
          ? req.file.buffer.length
          : undefined,
        undefined,
        uploadOptions,
      );

      res.status(200).json({
        message: "File uploaded successfully",
        fileName: fileName,
        url: blockBlobClient.url,
      });
    } catch (error) {
      console.error(`Error uploading file: ${error.message}`);
      res.status(500).json({ error: error.message });
    }
  },
);

// List all blobs in a container
router.get("/list/:containerName", async (req, res, next) => {
  try {
    const containerName = req.params.containerName;
    const containerClient = await getContainerClient(containerName);

    // List blobs
    const blobs = [];
    for await (const blob of containerClient.listBlobsFlat()) {
      blobs.push({
        name: blob.name,
        contentType: blob.properties.contentType,
        lastModified: blob.properties.lastModified,
        contentLength: blob.properties.contentLength,
        url: `${containerClient.url}/${blob.name}`,
      });
    }

    res.status(200).json(blobs);
  } catch (error) {
    console.error(`Error listing blobs: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

// Download blob
router.get("/download/:containerName/:blobName", async (req, res, next) => {
  try {
    const containerName = req.params.containerName;
    const blobName = req.params.blobName;

    const containerClient = await getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    // Check if blob exists
    const exists = await blockBlobClient.exists();
    if (!exists) {
      return res.status(404).json({ error: "Blob not found" });
    }

    // Get blob properties
    const properties = await blockBlobClient.getProperties();

    // Set response headers
    res.setHeader("Content-Disposition", `attachment; filename=${blobName}`);
    res.setHeader("Content-Type", properties.contentType);
    res.setHeader("Content-Length", properties.contentLength);

    // Download blob to response stream
    const downloadResponse = await blockBlobClient.download();
    downloadResponse.readableStreamBody.pipe(res);
  } catch (error) {
    console.error(`Error downloading blob: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

// Delete blob
router.delete("/delete/:containerName/:blobName", async (req, res, next) => {
  try {
    const containerName = req.params.containerName;
    const blobName = req.params.blobName;

    const containerClient = await getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    // Check if blob exists
    const exists = await blockBlobClient.exists();
    if (!exists) {
      return res.status(404).json({ error: "Blob not found" });
    }

    // Delete blob
    await blockBlobClient.delete();

    res.status(200).json({
      message: "Blob deleted successfully",
      blobName: blobName,
    });
  } catch (error) {
    console.error(`Error deleting blob: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
