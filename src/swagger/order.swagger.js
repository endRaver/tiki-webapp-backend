// backend/swagger/order.swagger.js
/**
 * @swagger
 * tags:
 *   name: Order
 *   description: Order management
 */

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Get all orders
 *     tags: [Order]
 *     responses:
 *       200:
 *         description: Orders retrieved successfully
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Get order by id
 *     tags: [Order]
 *     responses:
 *       200:
 *         description: Order retrieved successfully
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /orders/{id}:
 *   put:
 *     summary: Update order by id
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The id of the order to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum:
 *                   - pending
 *                   - confirmed
 *                   - shipped
 *                   - delivered
 *     tags: [Order]
 *     responses:
 *       200:
 *         description: Order updated successfully
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /orders/{id}:
 *   delete:  
 *     summary: Delete order by id
 *     tags: [Order]
 *     responses:
 *       200:
 *         description: Order deleted successfully
 *       500:
 *         description: Server error
 */