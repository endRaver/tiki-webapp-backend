// backend/swagger/coupon.swagger.js
/**
 * @swagger
 * tags:
 *   name: Coupon
 *   description: Coupon management
 */

/**
 * @swagger
  * /coupons:
 *   get:
 *     summary: Get the coupon for the user
 *     tags: [Coupon]
 *     responses:
 *       200:
 *         description: Coupon retrieved successfully
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /coupons:
 *   post:
 *     summary: Validate the coupon
 *     tags: [Coupon]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Coupon validated successfully
 *       404:
 *         description: Invalid coupon code
 *       500:
 *         description: Server error
 */

