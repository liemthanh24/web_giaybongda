// API: Cập nhật sản phẩm
app.put('/api/products/:id', (req, res) => {
    const { id } = req.params;
    const { name, brand, price, image, description, stock, colors, sizes } = req.body;

    // Log request data
    console.log('Update request:', {
        id,
        body: req.body
    });

    // Convert values to proper types
    const numericStock = parseInt(stock || 0);
    const numericPrice = parseInt(price || 0);
    const colorsJson = JSON.stringify(colors || []);
    const sizesJson = JSON.stringify(sizes || []);

    const query = `
        UPDATE products 
        SET name = ?, 
            brand = ?, 
            price = ?, 
            image = ?, 
            description = ?, 
            stock = ?,
            colors = ?,
            sizes = ?
        WHERE id = ?
    `;

    db.query(
        query,
        [name, brand, numericPrice, image, description, numericStock, colorsJson, sizesJson, id],
        (err, result) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ 
                    error: 'Database error', 
                    details: err.message 
                });
            }

            // Check if any row was updated
            if (result.affectedRows === 0) {
                return res.status(404).json({
                    error: 'Product not found',
                    details: `No product found with id ${id}`
                });
            }

            // Return updated product
            db.query('SELECT * FROM products WHERE id = ?', [id], (err, products) => {
                if (err) {
                    console.error('Error fetching updated product:', err);
                    return res.status(500).json({ 
                        error: 'Database error',
                        details: err.message
                    });
                }

                // Parse JSON strings back to arrays
                const product = products[0];
                try {
                    product.colors = JSON.parse(product.colors || '[]');
                    product.sizes = JSON.parse(product.sizes || '[]');
                } catch (e) {
                    console.error('Error parsing JSON:', e);
                    product.colors = [];
                    product.sizes = [];
                }

                res.json(product);
            });
        }
    );
});

// API: Thêm sản phẩm mới
app.post('/api/products', async (req, res) => {
    try {
        const { name, brand, price, stock, image, description, colors, sizes } = req.body;

        // Validate input
        if (!name || !brand || !price) {
            return res.status(400).json({ 
                error: 'Missing required fields',
                details: 'Name, brand, and price are required'
            });
        }

        // Generate product code
        const code = await generateProductCode(brand);

        // Convert values to proper types
        const numericStock = parseInt(stock || 0);
        const numericPrice = parseInt(price || 0);
        const colorsJson = JSON.stringify(colors || []);
        const sizesJson = JSON.stringify(sizes || []);

        const productData = {
            name: name.trim(),
            code: code,
            brand: brand.trim(),
            price: numericPrice,
            stock: numericStock,
            image: image?.trim() || null,
            description: description?.trim() || null,
            colors: colorsJson,
            sizes: sizesJson,
            created_at: new Date()
        };

        // Log the data being inserted
        console.log('Inserting product:', productData);

        // Insert new product
        db.query('INSERT INTO products SET ?', productData, (err, result) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({
                    error: 'Database error',
                    details: err.message
                });
            }

            // Return the created product
            db.query('SELECT * FROM products WHERE id = ?', [result.insertId], (err, products) => {
                if (err) {
                    console.error('Error fetching created product:', err);
                    return res.status(500).json({
                        error: 'Database error',
                        details: err.message
                    });
                }

                // Parse JSON strings back to arrays
                const product = products[0];
                try {
                    product.colors = JSON.parse(product.colors || '[]');
                    product.sizes = JSON.parse(product.sizes || '[]');
                } catch (e) {
                    console.error('Error parsing JSON:', e);
                    product.colors = [];
                    product.sizes = [];
                }

                res.status(201).json(product);
            });
        });
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({
            error: 'Server error',
            details: error.message
        });
    }
});
