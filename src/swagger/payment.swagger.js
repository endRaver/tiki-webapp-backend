// backend/swagger/payment.swagger.js
/**
 * @swagger
 * tags:
 *   name: Payment
 *   description: Payment management
 */

// TODO: Double check the request body
/**
 * @swagger
 * /payment:
 *   post:
 *     summary: Create checkout session
 *     tags: [Payment]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               products: 
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: string
 *                     name:
 *                       type: string
 *                     price:
 *                       type: number
 *                     quantity:
 *                       type: number
 *                     image:
 *                       type: string
 *               couponCode:
 *                 type: string
 *     responses:
 *       200:
 *         description: Checkout session created successfully
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /payment/checkout-success:
 *   post:
 *     summary: Handle checkout success
 *     tags: [Payment]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:  
 *               sessionId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Checkout success handled successfully
 *       500:
 *         description: Server error
 */
