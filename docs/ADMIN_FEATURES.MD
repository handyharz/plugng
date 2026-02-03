# 🛒 Admin Features Guide

![Category Creation Tutorial](//Users/harz/Documents/backUps/plugng-shop/docs/images/category_creation_tutorial_1769814583192.png)

### Tutorial: 3-Step Category Creation

**Step 1 (Top): Add Level 1 - Brand**
- **Goal**: Create a top-level brand category.
- **Form Fields**:
  * *Category Name*: "Huawei"
  * *Parent Category*: "None (Top Level)"
  * *Description*: "Premium accessories for Huawei smartphones"
- **Result**: Creates a **LEVEL 1: BRAND** category.

**Step 2 (Middle): Add Level 2 - Accessory Type**
- **Goal**: Add a sub-category under the brand.
- **Form Fields**:
  * *Category Name*: "Cases & Covers"
  * *Parent Category*: "Huawei" (Select from dropdown)
  * *Description*: "Protective cases for Huawei devices"
- **Result**: Creates a **LEVEL 2: SUB-CATEGORY**.

**Step 3 (Bottom): Add Level 3 - Specific Type**
- **Goal**: Add a specific product type under the accessory category.
- **Form Fields**:
  * *Category Name*: "Silicone Cases"
  * *Parent Category*: "Huawei - Cases & Covers" (Select from dropdown)
  * *Description*: "Soft silicone protective cases"
- **Result**: Creates a **LEVEL 3: SPECIFIC TYPE**.

This guide details the powerful management tools available in the PlugNG Admin Dashboard.

---

## 📂 Category Management System

The Category Management page allows you to organize products into a logical, 3-level hierarchy. This structure is critical for customer navigation and SEO.

### 1. Hierarchy Structure
The system supports 3 levels of nesting:
- **Level 1 (Top): Brand** (e.g., *Samsung, Apple, Oraimo*)
- **Level 2 (Middle): Accessory Type** (e.g., *Cases, Chargers, Screen Protectors*)
- **Level 3 (Bottom): Specific Type** (e.g., *Silicone Cases, 20W Chargers*)

> **Tip:** The system prevents creating Level 4 categories to ensure the menu remains simple and usable for customers.

---

### 2. Creating Categories
There are **4 ways** to create categories, designed for different workflows.

#### A. Standard Method (Blue Button)
*Best for: Creating a single top-level category.*
1. Click the **New Category** button (top right).
2. Fill in the Name (e.g., "Google Pixel").
3. Leave Parent as "None (Top Level)".
4. Click **Create Category**.

#### B. Quick Add (Green Folder Icon) ⚡
*Best for: Quickly adding a subcategory to an existing parent.*
1. Find the parent category in the list.
2. Click the **Green Folder Icon (`+`)** on that row.
3. The modal opens with the **Parent already selected**.
4. Type the name and click Create.
   * *Example: Click Green Folder on "Samsung" -> Type "Cases" -> Create.*

#### C. Continuous Creation (Power User) 🚀
*Best for: Building entire trees without closing the form.*
Inside the "New Category" form, you have two special buttons:
- **`+ Sibling`**: Saves the current category and resets the form to add *another one at the same level*.
  - *Use Case: Adding "Samsung", then "Apple", then "Tecno".*
- **`+ Child`**: Saves the current category and *sets it as the parent* for the next one.
  - *Use Case: Adding "Samsung" -> Click Child -> Adding "Cases" -> Click Child -> Adding "Silicone".*

**Real-world Example (Huawei Tree):** 🛠️
1. Open form, type Name: `Huawei`.
2. Click **`+ Child`** (Saved! Parent is now "Huawei").
3. Type Name: `Cases & Covers`.
4. Click **`+ Child`** (Saved! Parent is now "Cases & Covers").
5. Type Name: `Silicone Cases`.
6. Click **`Create Category`** (Done!).
*Result: You built a complete 3-level Huawei hierarchy in 10 seconds.*

#### D. Bulk Import (CSV) 📦
*Best for: Initial setup or large migrations.*
1. Click the **Bulk Import** button (top right).
2. Upload a `.csv` file. You can find a [sample import file here](file:///Users/harz/Documents/backUps/plugng-shop/docs/bulk_categories_sample.csv).
3. The CSV should have the following header format:
   ```csv
   name,parent,description,image
   "Cases","Samsung","Protective cases","..."
   "Silicone","Cases","Soft silicone cases","..."
   ```
   *Note: The system automatically matches "parent" names to existing category IDs.*

---

### 3. Editing & Managing

#### Editing
- Click the **Pencil Icon** on any category row.
- You can rename, move (change parent), or update the description/image.
- **Note:** Moving a category moves all its children with it!

#### Deleting (Safety Rules) 🛡️
- Click the **Red Trash Icon**.
- **Safety Lock:** You **CANNOT** delete a category if it has:
  1. **Subcategories** (e.g., can't delete "Samsung" if it has "Cases").
  2. **Products** (e.g., can't delete "Cases" if products are assigned to it).
- **Fix:** Delete the subcategories first (bottom-up approach) and move/delete products.

#### Search & Filter
- Use the search bar to find categories instantly.
- **Smart Filter:** Searching for a parent (e.g., "Samsung") shows all its children. Searching for a child (e.g., "Silicone") shows its parent path.

---

### 4. Admin Tips
- **Navigating the Tree:** Use the **Chevron (`>`)** icons to expand/collapse branches.
- **Status Badges:**
  - `📱`: Indicates a Level 1 (Brand) category in dropdowns.
  - `└─`: Indicates a Level 2 (Type) category in dropdowns.
  - **Green Badge**: Shows the number of products in that category.

### 5. Category Depth & Future Scalability 📈

#### Why 3 Levels?
The current 3-level limit (Brand > Type > Specific) is enforced to:
1.  **Simplify Navigation**: Deeper menus confuse customers on mobile devices.
2.  **SEO Optimization**: Keeps URLs clean (e.g., `/products/huawei/cases/silicone`).
3.  **UI Performance**: Ensures dropdowns and trees remain responsive.

#### When would you need >3 Levels?
You might need Level 4 or 5 for highly technical interaction:
- **Automotive**: `Toyota` > `Corolla` > `2024` > `Engine` > `Pistons` (5 Levels)
- **Electronics**: `Components` > `Resistors` > `SMD` > `0805` > `1% Tolerance` (5 Levels)

#### How to Increase the Limit?
If your store evolves to support these complex catalogs, a developer can update it:
1.  **Frontend**: Update `src/app/(admin)/dashboard/categories/page.tsx` to allow selecting Level 3 parents.
2.  **Backend**: The database `level` field supports any number, but the API may need to adjust validation.
3.  **UI**: The sidebar tree and dropdowns would need small tweaks to display Level 4+ indentation.
