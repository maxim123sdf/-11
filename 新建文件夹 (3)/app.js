// 初始化 LeanCloud
AV.init({
    appId: "H0RYZUGpZ6auG7Njrd4fbyWD-gzGzoHsz",
    appKey: "tenY3Ksbmgns38v74l48Symx",
    serverURL: "https://h0ryzugp.lc-cn-n1-shared.com"
});

/**
 * 上传文件到LeanCloud
 */
async function uploadFile() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    
    if (!file) {
        alert('请选择文件');
        return;
    }

    try {
        // 创建 AV.File 实例
        const avFile = new AV.File(file.name, file);
        
        // 设置文件访问控制
        const acl = new AV.ACL();
        acl.setPublicReadAccess(true);
        acl.setPublicWriteAccess(false);
        avFile.setACL(acl);
        
        // 保存文件
        const savedFile = await avFile.save();
        
        // 创建 Files 类（而不是 FileRecord）
        const Files = AV.Object.extend('Files');
        const fileRecord = new Files();
        fileRecord.setACL(acl);
        fileRecord.set('fileName', file.name);
        fileRecord.set('file', savedFile);
        await fileRecord.save();

        alert('文件上传成功！');
        loadFiles(); // 重新加载文件列表
    } catch (error) {
        console.error('上传失败:', error);
        alert('文件上传失败：' + error.message);
    }
}

/**
 * 加载文件列表
 */
async function loadFiles() {
    try {
        const query = new AV.Query('Files');
        const results = await query.find();
        
        const filesList = document.getElementById('filesList');
        filesList.innerHTML = '';
        
        results.forEach(file => {
            const avFile = file.get('file');
            if (avFile) {
                const li = document.createElement('li');
                li.innerHTML = `
                    <span>${file.get('fileName')}</span>
                    <a href="${avFile.url()}" target="_blank">
                        <button>下载</button>
                    </a>
                `;
                filesList.appendChild(li);
            }
        });
    } catch (error) {
        console.error('加载文件列表失败:', error);
    }
}

/**
 * 创建新订单
 */
async function createOrder() {
    const quantityInput = document.getElementById('orderQuantity');
    const quantity = parseInt(quantityInput.value);
    
    if (!quantity || quantity < 1) {
        alert('请输入有效的数量');
        return;
    }

    try {
        // 创建订单对象
        const Order = AV.Object.extend('Order');
        const order = new Order();
        
        // 设置订单数据
        order.set('quantity', quantity);
        order.set('status', '新订单');
        order.set('orderNumber', generateOrderNumber());
        order.set('createTime', new Date());

        await order.save();
        
        alert('订单创建成功！');
        quantityInput.value = ''; // 清空输入
        loadOrders(); // 重新加载订单列表
    } catch (error) {
        console.error('创建订单失败:', error);
        alert('创建订单失败：' + error.message);
    }
}

/**
 * 生成订单编号
 */
function generateOrderNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `ORD${year}${month}${day}${random}`;
}

/**
 * 加载订单列表
 */
async function loadOrders() {
    try {
        const query = new AV.Query('Order');
        query.descending('createdAt'); // 按创建时间降序排序
        const results = await query.find();
        
        const ordersList = document.getElementById('ordersList');
        ordersList.innerHTML = '';
        
        results.forEach(order => {
            const li = document.createElement('li');
            const createTime = new Date(order.get('createTime'));
            li.innerHTML = `
                <div class="order-info">
                    <span>订单号: ${order.get('orderNumber')}</span>
                    <span>数量: ${order.get('quantity')}</span>
                    <span class="order-status">${order.get('status')}</span>
                    <span>创建时间: ${createTime.toLocaleString()}</span>
                </div>
            `;
            ordersList.appendChild(li);
        });
    } catch (error) {
        console.error('加载订单列表失败:', error);
    }
}

// 页面加载时获取文件列表和订单列表
document.addEventListener('DOMContentLoaded', () => {
    loadFiles();
    loadOrders();
}); 