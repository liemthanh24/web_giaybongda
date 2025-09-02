// API: Xóa sản phẩm
app.delete('/api/products/:id', (req, res) => {
    const { id } = req.params;
    console.log('Deleting product with ID:', id);

    // Kiểm tra sản phẩm tồn tại
    db.query('SELECT * FROM products WHERE id = ?', [id], (err, results) => {
        if (err) {
            console.error('Error checking product:', err);
            return res.status(500).json({
                error: 'Database error',
                details: err.message
            });
        }

        if (!results || results.length === 0) {
            return res.status(404).json({
                error: 'Product not found',
                details: 'Product does not exist'
            });
        }

        // Xóa sản phẩm
        db.query('DELETE FROM products WHERE id = ?', [id], (err, result) => {
            if (err) {
                console.error('Error deleting product:', err);
                return res.status(500).json({
                    error: 'Failed to delete product',
                    details: err.message
                });
            }

            console.log('Delete result:', result);
            res.json({
                success: true,
                message: 'Product deleted successfully'
            });
        });
    });
});
