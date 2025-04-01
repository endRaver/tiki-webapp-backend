// backend/swagger/seller.swagger.js

/**
 * @swagger
 * tags:
 *   name: Sellers
 *   description: Seller management
 */

/**
 * @swagger
 * /sellers:
 *   get:
 *     summary: Get all sellers
 *     tags: [Sellers]
 *     responses:
 *       200:
 *         description: A list of sellers
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /sellers/{id}:
 *   get:
 *     summary: Get a seller by ID
 *     tags: [Sellers]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the seller
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A seller
 *       404:
 *         description: Seller not found
 *       500:
 *         description: Server error
 */ 