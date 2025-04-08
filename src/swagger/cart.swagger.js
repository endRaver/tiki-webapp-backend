// backend/swagger/cart.swagger.js
/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: Cart management
 */

/**
 * @swagger
 * /carts:
 *   get:
 *     summary: Get all products in the cart
 *     tags: [Cart]
 *     responses:
 *       200:
 *         description: A list of products in the cart
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /carts:
 *   post:
 *     summary: Add a product to the cart
 *     tags: [Cart]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *                 example: "60d3b414677e222b80d0e0b6"
 *     responses:
 *       200:
 *         description: Product added to cart successfully
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /carts:
 *   delete:
 *     summary: Remove all items of a product from the cart
 *     tags: [Cart]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *                 example: "60d3b414677e222b80d0e0b6"
 *     responses:
 *       200:
 *         description: All items of the product removed from cart successfully
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /carts/{id}:
 *   put:
 *     summary: Update the quantity of a product in the cart
 *     tags: [Cart]
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
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: number
 *                 example: 1
 *     responses:
 *       200:
 *         description: Quantity updated successfully
 *       500:
 *         description: Server error
 */

