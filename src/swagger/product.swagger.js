// src/swagger/product.swagger.js

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product management
 */

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: A list of products
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /products/category/{category}:
 *   get:
 *     summary: Get products by category
 *     tags: [Products]
 *     parameters:
 *       - name: category
 *         in: path
 *         required: true
 *         description: The category to filter products
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of products in the specified category
 *       404:
 *         description: Category not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /products/recommendations:
 *   get:
 *     summary: Get recommended products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: A list of recommended products
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - category
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               category:
 *                 type: string
 *               authors:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of author names
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Product images (multiple files)
 *               seller_price:
 *                 type: number
 *                 description: Seller price
 *               seller_id:
 *                 type: string
 *                 description: Seller ID
 *               specifications:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     attributes:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           code:
 *                             type: string
 *                           name:
 *                             type: string
 *                           value:
 *                             type: string
 *     responses:
 *       201:
 *         description: Product created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Update a product
 *     tags: [Products]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the product to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               category:
 *                 type: string
 *               authors:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of author names
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Product images (multiple files)
 *               seller_price:
 *                 type: number
 *                 nullable: true  # Allow this field to be null
 *                 description: Seller price
 *               seller_id:
 *                 type: string
 *                 nullable: true  # Allow this field to be null
 *                 description: Seller ID
 *               specifications:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     attributes:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           code:
 *                             type: string
 *                           name:
 *                             type: string
 *                           value:
 *                             type: string
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Delete a product
 *     tags: [Products]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the product to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */