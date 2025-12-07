-- ============================================================
-- FIX RLS POLICY PERFORMANCE - UPDATE EXISTING POLICIES
-- ============================================================
-- This script updates existing RLS policies to use (SELECT auth.uid())
-- instead of auth.uid() for better query performance at scale.
--
-- Run this AFTER enable_rls.sql if you already applied the original.
-- ============================================================

-- Drop and recreate all policies with optimized auth.uid() calls

-- ------------------------------------------------------------
-- USER TABLE POLICIES
-- ------------------------------------------------------------

DROP POLICY IF EXISTS "Users can view own profile" ON "User";
DROP POLICY IF EXISTS "Users can update own profile" ON "User";
DROP POLICY IF EXISTS "Enable insert for authentication" ON "User";

CREATE POLICY "Users can view own profile"
ON "User"
FOR SELECT
USING ((SELECT auth.uid())::text = id);

CREATE POLICY "Users can update own profile"
ON "User"
FOR UPDATE
USING ((SELECT auth.uid())::text = id)
WITH CHECK ((SELECT auth.uid())::text = id);

CREATE POLICY "Enable insert for authentication"
ON "User"
FOR INSERT
WITH CHECK ((SELECT auth.uid())::text = id);

-- ------------------------------------------------------------
-- CART TABLE POLICIES
-- ------------------------------------------------------------

DROP POLICY IF EXISTS "Users can view own cart" ON "Cart";
DROP POLICY IF EXISTS "Users can create own cart" ON "Cart";
DROP POLICY IF EXISTS "Users can update own cart" ON "Cart";
DROP POLICY IF EXISTS "Users can delete own cart" ON "Cart";

CREATE POLICY "Users can view own cart"
ON "Cart"
FOR SELECT
USING ((SELECT auth.uid())::text = "userId");

CREATE POLICY "Users can create own cart"
ON "Cart"
FOR INSERT
WITH CHECK ((SELECT auth.uid())::text = "userId");

CREATE POLICY "Users can update own cart"
ON "Cart"
FOR UPDATE
USING ((SELECT auth.uid())::text = "userId")
WITH CHECK ((SELECT auth.uid())::text = "userId");

CREATE POLICY "Users can delete own cart"
ON "Cart"
FOR DELETE
USING ((SELECT auth.uid())::text = "userId");

-- ------------------------------------------------------------
-- CART ITEM TABLE POLICIES
-- ------------------------------------------------------------

DROP POLICY IF EXISTS "Users can view own cart items" ON "CartItem";
DROP POLICY IF EXISTS "Users can add items to own cart" ON "CartItem";
DROP POLICY IF EXISTS "Users can update own cart items" ON "CartItem";
DROP POLICY IF EXISTS "Users can delete own cart items" ON "CartItem";

CREATE POLICY "Users can view own cart items"
ON "CartItem"
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM "Cart"
    WHERE "Cart".id = "CartItem"."cartId"
    AND "Cart"."userId" = (SELECT auth.uid())::text
  )
);

CREATE POLICY "Users can add items to own cart"
ON "CartItem"
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "Cart"
    WHERE "Cart".id = "cartId"
    AND "Cart"."userId" = (SELECT auth.uid())::text
  )
);

CREATE POLICY "Users can update own cart items"
ON "CartItem"
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM "Cart"
    WHERE "Cart".id = "CartItem"."cartId"
    AND "Cart"."userId" = (SELECT auth.uid())::text
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "Cart"
    WHERE "Cart".id = "cartId"
    AND "Cart"."userId" = (SELECT auth.uid())::text
  )
);

CREATE POLICY "Users can delete own cart items"
ON "CartItem"
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM "Cart"
    WHERE "Cart".id = "CartItem"."cartId"
    AND "Cart"."userId" = (SELECT auth.uid())::text
  )
);

-- ------------------------------------------------------------
-- WISHLIST TABLE POLICIES
-- ------------------------------------------------------------

DROP POLICY IF EXISTS "Users can view own wishlist" ON "Wishlist";
DROP POLICY IF EXISTS "Users can create own wishlist" ON "Wishlist";
DROP POLICY IF EXISTS "Users can update own wishlist" ON "Wishlist";
DROP POLICY IF EXISTS "Users can delete own wishlist" ON "Wishlist";

CREATE POLICY "Users can view own wishlist"
ON "Wishlist"
FOR SELECT
USING ((SELECT auth.uid())::text = "userId");

CREATE POLICY "Users can create own wishlist"
ON "Wishlist"
FOR INSERT
WITH CHECK ((SELECT auth.uid())::text = "userId");

CREATE POLICY "Users can update own wishlist"
ON "Wishlist"
FOR UPDATE
USING ((SELECT auth.uid())::text = "userId")
WITH CHECK ((SELECT auth.uid())::text = "userId");

CREATE POLICY "Users can delete own wishlist"
ON "Wishlist"
FOR DELETE
USING ((SELECT auth.uid())::text = "userId");

-- ------------------------------------------------------------
-- WISHLIST ITEM TABLE POLICIES
-- ------------------------------------------------------------

DROP POLICY IF EXISTS "Users can view own wishlist items" ON "WishlistItem";
DROP POLICY IF EXISTS "Users can add items to own wishlist" ON "WishlistItem";
DROP POLICY IF EXISTS "Users can delete own wishlist items" ON "WishlistItem";

CREATE POLICY "Users can view own wishlist items"
ON "WishlistItem"
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM "Wishlist"
    WHERE "Wishlist".id = "WishlistItem"."wishlistId"
    AND "Wishlist"."userId" = (SELECT auth.uid())::text
  )
);

CREATE POLICY "Users can add items to own wishlist"
ON "WishlistItem"
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "Wishlist"
    WHERE "Wishlist".id = "wishlistId"
    AND "Wishlist"."userId" = (SELECT auth.uid())::text
  )
);

CREATE POLICY "Users can delete own wishlist items"
ON "WishlistItem"
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM "Wishlist"
    WHERE "Wishlist".id = "WishlistItem"."wishlistId"
    AND "Wishlist"."userId" = (SELECT auth.uid())::text
  )
);

-- ------------------------------------------------------------
-- ORDER TABLE POLICIES
-- ------------------------------------------------------------

DROP POLICY IF EXISTS "Users can view own orders" ON "Order";
DROP POLICY IF EXISTS "Users can create orders" ON "Order";
DROP POLICY IF EXISTS "Users can update own orders" ON "Order";

CREATE POLICY "Users can view own orders"
ON "Order"
FOR SELECT
USING (
  (SELECT auth.uid())::text = "userId"
  OR "userId" IS NULL
);

CREATE POLICY "Users can create orders"
ON "Order"
FOR INSERT
WITH CHECK (
  (SELECT auth.uid())::text = "userId"
  OR "userId" IS NULL
);

CREATE POLICY "Users can update own orders"
ON "Order"
FOR UPDATE
USING ((SELECT auth.uid())::text = "userId")
WITH CHECK ((SELECT auth.uid())::text = "userId");

-- ------------------------------------------------------------
-- ORDER ITEM TABLE POLICIES
-- ------------------------------------------------------------

DROP POLICY IF EXISTS "Users can view own order items" ON "OrderItem";
DROP POLICY IF EXISTS "Users can create order items" ON "OrderItem";

CREATE POLICY "Users can view own order items"
ON "OrderItem"
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM "Order"
    WHERE "Order".id = "OrderItem"."orderId"
    AND ("Order"."userId" = (SELECT auth.uid())::text OR "Order"."userId" IS NULL)
  )
);

CREATE POLICY "Users can create order items"
ON "OrderItem"
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "Order"
    WHERE "Order".id = "orderId"
    AND ("Order"."userId" = (SELECT auth.uid())::text OR "Order"."userId" IS NULL)
  )
);

-- ------------------------------------------------------------
-- PAYMENT TABLE POLICIES
-- ------------------------------------------------------------

DROP POLICY IF EXISTS "Users can view own payments" ON "Payment";
DROP POLICY IF EXISTS "Users can create payments for own orders" ON "Payment";
DROP POLICY IF EXISTS "Users can update own payments" ON "Payment";

CREATE POLICY "Users can view own payments"
ON "Payment"
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM "Order"
    WHERE "Order".id = "Payment"."orderId"
    AND ("Order"."userId" = (SELECT auth.uid())::text OR "Order"."userId" IS NULL)
  )
);

CREATE POLICY "Users can create payments for own orders"
ON "Payment"
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "Order"
    WHERE "Order".id = "orderId"
    AND ("Order"."userId" = (SELECT auth.uid())::text OR "Order"."userId" IS NULL)
  )
);

CREATE POLICY "Users can update own payments"
ON "Payment"
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM "Order"
    WHERE "Order".id = "Payment"."orderId"
    AND ("Order"."userId" = (SELECT auth.uid())::text OR "Order"."userId" IS NULL)
  )
);

-- ============================================================
-- DONE! All policies now use optimized (SELECT auth.uid())
-- ============================================================
