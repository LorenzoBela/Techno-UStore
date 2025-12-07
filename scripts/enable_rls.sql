-- ============================================================
-- ENABLE ROW LEVEL SECURITY (RLS) ON ALL TABLES
-- ============================================================
-- This script enables RLS and creates appropriate policies for
-- all tables in the Techno UStore database.
-- 
-- Run this script in Supabase SQL Editor or via psql.
-- ============================================================

-- ============================================================
-- STEP 1: ENABLE RLS ON ALL TABLES
-- ============================================================

ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Category" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Subcategory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Product" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ProductVariant" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ProductImage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Order" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Payment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OrderItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "InventoryLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Settings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Cart" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CartItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Wishlist" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WishlistItem" ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- STEP 2: CREATE POLICIES
-- ============================================================

-- ------------------------------------------------------------
-- USER TABLE POLICIES
-- Users can read and update their own profile
-- Admins can read all users
-- ------------------------------------------------------------

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
ON "User"
FOR SELECT
USING ((SELECT auth.uid())::text = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON "User"
FOR UPDATE
USING ((SELECT auth.uid())::text = id)
WITH CHECK ((SELECT auth.uid())::text = id);

-- Allow insert for new user registration (via auth trigger)
CREATE POLICY "Enable insert for authentication"
ON "User"
FOR INSERT
WITH CHECK ((SELECT auth.uid())::text = id);

-- ------------------------------------------------------------
-- CATEGORY TABLE POLICIES
-- Public read access for everyone (including anonymous)
-- Write operations require service role (admin backend)
-- ------------------------------------------------------------

CREATE POLICY "Anyone can view categories"
ON "Category"
FOR SELECT
USING (true);

-- ------------------------------------------------------------
-- SUBCATEGORY TABLE POLICIES
-- Public read access for everyone
-- ------------------------------------------------------------

CREATE POLICY "Anyone can view subcategories"
ON "Subcategory"
FOR SELECT
USING (true);

-- ------------------------------------------------------------
-- PRODUCT TABLE POLICIES
-- Public read access for everyone
-- ------------------------------------------------------------

CREATE POLICY "Anyone can view products"
ON "Product"
FOR SELECT
USING (true);

-- ------------------------------------------------------------
-- PRODUCT VARIANT TABLE POLICIES
-- Public read access for everyone
-- ------------------------------------------------------------

CREATE POLICY "Anyone can view product variants"
ON "ProductVariant"
FOR SELECT
USING (true);

-- ------------------------------------------------------------
-- PRODUCT IMAGE TABLE POLICIES
-- Public read access for everyone
-- ------------------------------------------------------------

CREATE POLICY "Anyone can view product images"
ON "ProductImage"
FOR SELECT
USING (true);

-- ------------------------------------------------------------
-- SETTINGS TABLE POLICIES
-- Public read access for everyone
-- ------------------------------------------------------------

CREATE POLICY "Anyone can view settings"
ON "Settings"
FOR SELECT
USING (true);

-- ------------------------------------------------------------
-- CART TABLE POLICIES
-- Users can only access their own cart
-- ------------------------------------------------------------

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
-- Users can only access items in their own cart
-- ------------------------------------------------------------

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
-- Users can only access their own wishlist
-- ------------------------------------------------------------

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
-- Users can only access items in their own wishlist
-- ------------------------------------------------------------

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
-- Users can view and create their own orders
-- Guest orders (userId IS NULL) are managed via service role
-- ------------------------------------------------------------

CREATE POLICY "Users can view own orders"
ON "Order"
FOR SELECT
USING (
  (SELECT auth.uid())::text = "userId"
  OR "userId" IS NULL  -- Allow viewing guest orders (they'll be filtered by email in app)
);

CREATE POLICY "Users can create orders"
ON "Order"
FOR INSERT
WITH CHECK (
  (SELECT auth.uid())::text = "userId"
  OR "userId" IS NULL  -- Allow guest checkout
);

CREATE POLICY "Users can update own orders"
ON "Order"
FOR UPDATE
USING ((SELECT auth.uid())::text = "userId")
WITH CHECK ((SELECT auth.uid())::text = "userId");

-- ------------------------------------------------------------
-- ORDER ITEM TABLE POLICIES
-- Users can view items in their own orders
-- ------------------------------------------------------------

CREATE POLICY "Users can view own order items"
ON "OrderItem"
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM "Order"
    WHERE "Order".id = "OrderItem"."orderId"
    AND ("Order"."userId" = auth.uid()::text OR "Order"."userId" IS NULL)
  )
);

CREATE POLICY "Users can create order items"
ON "OrderItem"
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "Order"
    WHERE "Order".id = "orderId"
    AND ("Order"."userId" = auth.uid()::text OR "Order"."userId" IS NULL)
  )
);

-- ------------------------------------------------------------
-- PAYMENT TABLE POLICIES
-- Users can view and create payments for their own orders
-- ------------------------------------------------------------

CREATE POLICY "Users can view own payments"
ON "Payment"
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM "Order"
    WHERE "Order".id = "Payment"."orderId"
    AND ("Order"."userId" = auth.uid()::text OR "Order"."userId" IS NULL)
  )
);

CREATE POLICY "Users can create payments for own orders"
ON "Payment"
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "Order"
    WHERE "Order".id = "orderId"
    AND ("Order"."userId" = auth.uid()::text OR "Order"."userId" IS NULL)
  )
);

CREATE POLICY "Users can update own payments"
ON "Payment"
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM "Order"
    WHERE "Order".id = "Payment"."orderId"
    AND ("Order"."userId" = auth.uid()::text OR "Order"."userId" IS NULL)
  )
);

-- ------------------------------------------------------------
-- INVENTORY LOG TABLE POLICIES
-- Admin only - no public access
-- All operations go through service role (admin backend)
-- ------------------------------------------------------------

-- No policies = only service role can access
-- This is intentional for security

-- ============================================================
-- VERIFICATION QUERY
-- Run this after applying the script to verify RLS is enabled
-- ============================================================

-- SELECT 
--   schemaname,
--   tablename,
--   rowsecurity
-- FROM pg_tables
-- WHERE schemaname = 'public'
-- ORDER BY tablename;
