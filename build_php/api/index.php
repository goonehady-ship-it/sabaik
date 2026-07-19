<?php
/**
 * سبائك الماسة — PHP API
 * يعمل على أي استضافة PHP مع دعم SQLite (PDO_SQLite)
 */

// ─── CORS & Headers ──────────────────────────────────────────────────────────
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Authorization, Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ─── Database ────────────────────────────────────────────────────────────────
$dbPath = __DIR__ . '/../data/sabaik.db';
$dbDir  = dirname($dbPath);
if (!is_dir($dbDir)) mkdir($dbDir, 0755, true);

try {
    $pdo = new PDO('sqlite:' . $dbPath);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    $pdo->exec('PRAGMA journal_mode=WAL');
    $pdo->exec('PRAGMA foreign_keys=ON');
} catch (Exception $e) {
    json_error(500, 'Database connection failed: ' . $e->getMessage());
}

// ─── Init Schema & Seed ──────────────────────────────────────────────────────
initSchema($pdo);

// ─── AI Data (must be defined BEFORE router runs) ────────────────────────────
$AI_SERVICES = [
    ['id'=>'container_rental','title'=>'تأجير حاويات','description'=>'حاويات بأحجام مختلفة للبناء والترميم والهدم','image'=>'/images/container-1.jpeg','emoji'=>'📦'],
    ['id'=>'debris_transport','title'=>'نقل الأنقاض والردم','description'=>'نقل احترافي إلى مواقع الردم المعتمدة بالرياض','image'=>'/images/container-2.jpeg','emoji'=>'🚛'],
    ['id'=>'factory','title'=>'خدمات المصانع والورش','description'=>'حلول متكاملة ومتخصصة للمنشآت الصناعية','image'=>'/images/container-3.jpeg','emoji'=>'🏭'],
    ['id'=>'environmental','title'=>'الحلول البيئية','description'=>'خدمات صديقة للبيئة تدعم رؤية المملكة 2030','image'=>'/images/container-4.jpeg','emoji'=>'🌿'],
];
$AI_CONTAINERS = [
    ['id'=>'small_12','name'=>'حاوية صغيرة','size'=>'12 ياردة','capacity'=>'12 م³','price'=>150,'priceNote'=>'يومياً','image'=>'/images/container-1.jpeg','features'=>['مناسبة للمنازل','أعمال الترميم البسيط','المساحات الضيقة'],'bestFor'=>'الترميم والمنازل'],
    ['id'=>'medium_20','name'=>'حاوية متوسطة','size'=>'20 ياردة','capacity'=>'20 م³','price'=>200,'priceNote'=>'يومياً','image'=>'/images/container-2.jpeg','features'=>['المشاريع التجارية','أعمال الهدم المتوسطة','توصيل سريع'],'bestFor'=>'المشاريع التجارية'],
    ['id'=>'factory_30','name'=>'حاوية مصانع','size'=>'30 ياردة','capacity'=>'30 م³','price'=>280,'priceNote'=>'يومياً','image'=>'/images/container-3.jpeg','features'=>['المصانع والورش','تحمل أوزان ثقيلة','المخلفات الصناعية'],'bestFor'=>'المصانع والورش'],
    ['id'=>'large_40','name'=>'حاوية كبيرة','size'=>'40 ياردة','capacity'=>'40 م³','price'=>350,'priceNote'=>'يومياً','image'=>'/images/container-4.jpeg','features'=>['المشاريع الكبرى','أقصى سعة تخزينية','المجمعات السكنية'],'bestFor'=>'المشاريع الكبرى'],
];

// ─── Router ──────────────────────────────────────────────────────────────────
$method = $_SERVER['REQUEST_METHOD'];
$uri    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Strip /api prefix
$uri = preg_replace('#^/api#', '', $uri);
$uri = '/' . trim($uri, '/');

$body = [];
$raw  = file_get_contents('php://input');
if ($raw) {
    $body = json_decode($raw, true) ?? [];
}

// ─── Route Matching ──────────────────────────────────────────────────────────

// Health
if ($method === 'GET' && $uri === '/healthz') {
    json_out(['status' => 'ok']);
}

// Auth
if ($method === 'POST' && $uri === '/auth/login') {
    routeAuthLogin($pdo, $body);
}
if ($method === 'GET' && $uri === '/auth/me') {
    routeAuthMe($pdo);
}

// Admin stats
if ($method === 'GET' && $uri === '/admin/stats') {
    routeAdminStats($pdo);
}

// Slides
if ($method === 'GET' && $uri === '/slides') {
    routeList($pdo, 'hero_slides', 'order ASC');
}
if ($method === 'POST' && $uri === '/slides') {
    routeSlidesCreate($pdo, $body);
}
if ($method === 'PATCH' && preg_match('#^/slides/(\d+)$#', $uri, $m)) {
    routeSlidesUpdate($pdo, (int)$m[1], $body);
}
if ($method === 'DELETE' && preg_match('#^/slides/(\d+)$#', $uri, $m)) {
    routeDelete($pdo, 'hero_slides', (int)$m[1]);
}

// Services
if ($method === 'GET' && $uri === '/services') {
    routeList($pdo, 'services', 'order ASC');
}
if ($method === 'POST' && $uri === '/services') {
    routeServicesCreate($pdo, $body);
}
if ($method === 'PATCH' && preg_match('#^/services/(\d+)$#', $uri, $m)) {
    routeServicesUpdate($pdo, (int)$m[1], $body);
}
if ($method === 'DELETE' && preg_match('#^/services/(\d+)$#', $uri, $m)) {
    routeDelete($pdo, 'services', (int)$m[1]);
}

// Containers
if ($method === 'GET' && $uri === '/containers') {
    routeContainersList($pdo);
}
if ($method === 'POST' && $uri === '/containers') {
    routeContainersCreate($pdo, $body);
}
if ($method === 'PATCH' && preg_match('#^/containers/(\d+)$#', $uri, $m)) {
    routeContainersUpdate($pdo, (int)$m[1], $body);
}
if ($method === 'DELETE' && preg_match('#^/containers/(\d+)$#', $uri, $m)) {
    routeDelete($pdo, 'containers', (int)$m[1]);
}

// Partners
if ($method === 'GET' && $uri === '/partners') {
    routeList($pdo, 'partners', 'order ASC');
}
if ($method === 'POST' && $uri === '/partners') {
    routePartnersCreate($pdo, $body);
}
if ($method === 'PATCH' && preg_match('#^/partners/(\d+)$#', $uri, $m)) {
    routePartnersUpdate($pdo, (int)$m[1], $body);
}
if ($method === 'DELETE' && preg_match('#^/partners/(\d+)$#', $uri, $m)) {
    routeDelete($pdo, 'partners', (int)$m[1]);
}

// Testimonials
if ($method === 'GET' && $uri === '/testimonials') {
    routeList($pdo, 'testimonials', 'created_at DESC');
}
if ($method === 'POST' && $uri === '/testimonials') {
    routeTestimonialsCreate($pdo, $body);
}
if ($method === 'PATCH' && preg_match('#^/testimonials/(\d+)$#', $uri, $m)) {
    routeTestimonialsUpdate($pdo, (int)$m[1], $body);
}
if ($method === 'DELETE' && preg_match('#^/testimonials/(\d+)$#', $uri, $m)) {
    routeDelete($pdo, 'testimonials', (int)$m[1]);
}

// Company Values
if ($method === 'GET' && $uri === '/values') {
    routeList($pdo, 'company_values', 'order ASC');
}
if ($method === 'POST' && $uri === '/values') {
    routeValuesCreate($pdo, $body);
}
if ($method === 'PATCH' && preg_match('#^/values/(\d+)$#', $uri, $m)) {
    routeValuesUpdate($pdo, (int)$m[1], $body);
}
if ($method === 'DELETE' && preg_match('#^/values/(\d+)$#', $uri, $m)) {
    routeDelete($pdo, 'company_values', (int)$m[1]);
}

// Notifications — read-all BEFORE :id route
if ($method === 'PATCH' && $uri === '/notifications/read-all') {
    $pdo->exec("UPDATE notifications SET is_read=1");
    json_out(['success' => true]);
}
if ($method === 'GET' && $uri === '/notifications') {
    routeList($pdo, 'notifications', 'created_at DESC');
}
if ($method === 'PATCH' && preg_match('#^/notifications/(\d+)/read$#', $uri, $m)) {
    $stmt = $pdo->prepare("UPDATE notifications SET is_read=1 WHERE id=? RETURNING *");
    $stmt->execute([(int)$m[1]]);
    $row = $stmt->fetch();
    if (!$row) json_error(404, 'Not found');
    json_out(castNotification($row));
}

// Service Requests
if ($method === 'GET' && $uri === '/service-requests') {
    routeServiceRequestsList($pdo);
}
if ($method === 'POST' && $uri === '/service-requests') {
    routeServiceRequestsCreate($pdo, $body);
}
if ($method === 'GET' && preg_match('#^/service-requests/(\d+)$#', $uri, $m)) {
    $stmt = $pdo->prepare("SELECT * FROM service_requests WHERE id=?");
    $stmt->execute([(int)$m[1]]);
    $row = $stmt->fetch();
    if (!$row) json_error(404, 'Not found');
    json_out(castServiceRequest($row));
}
if ($method === 'PATCH' && preg_match('#^/service-requests/(\d+)$#', $uri, $m)) {
    routeServiceRequestsUpdate($pdo, (int)$m[1], $body);
}

// Conversations
if ($method === 'GET' && $uri === '/conversations') {
    routeList($pdo, 'conversations', 'updated_at DESC');
}
if ($method === 'POST' && $uri === '/conversations') {
    routeConversationsCreate($pdo, $body);
}
if ($method === 'PATCH' && preg_match('#^/conversations/(\d+)$#', $uri, $m)) {
    routeConversationsUpdate($pdo, (int)$m[1], $body);
}
if ($method === 'GET' && preg_match('#^/conversations/(\d+)/messages$#', $uri, $m)) {
    routeConversationMessages($pdo, (int)$m[1]);
}
if ($method === 'POST' && preg_match('#^/conversations/(\d+)/messages$#', $uri, $m)) {
    routeConversationMessageCreate($pdo, (int)$m[1], $body);
}

// AI Chat
if ($method === 'GET' && $uri === '/ai/chat/welcome') {
    json_out(aiWelcome());
}
if ($method === 'POST' && $uri === '/ai/chat') {
    routeAiChat($pdo, $body);
}

// 404 fallback
json_error(404, 'Route not found: ' . $method . ' ' . $uri);

// ═══════════════════════════════════════════════════════════════════════════
// ─── ROUTE HANDLERS ──────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════

// ── Auth ────────────────────────────────────────────────────────────────────

function routeAuthLogin(PDO $pdo, array $body): void {
    $username = $body['username'] ?? '';
    $password = $body['password'] ?? '';
    if (!$username || !$password) json_error(400, 'Username and password required');

    $stmt = $pdo->prepare("SELECT * FROM admins WHERE username=?");
    $stmt->execute([$username]);
    $admin = $stmt->fetch();
    if (!$admin) json_error(401, 'Invalid credentials');

    $hashed = hash('sha256', $password . 'sabaik_salt');
    if ($admin['password_hash'] !== $hashed) json_error(401, 'Invalid credentials');

    $token = base64_encode(json_encode(['adminId' => $admin['id'], 'ts' => time() * 1000]));
    json_out([
        'token' => $token,
        'user'  => ['id' => $admin['id'], 'username' => $admin['username'], 'name' => $admin['name']],
    ]);
}

function routeAuthMe(PDO $pdo): void {
    $auth = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (!$auth || !str_starts_with($auth, 'Bearer ')) json_error(401, 'Unauthorized');
    try {
        $payload = json_decode(base64_decode(substr($auth, 7)), true);
        $stmt = $pdo->prepare("SELECT * FROM admins WHERE id=?");
        $stmt->execute([$payload['adminId']]);
        $admin = $stmt->fetch();
        if (!$admin) json_error(401, 'Unauthorized');
        json_out(['id' => $admin['id'], 'username' => $admin['username'], 'name' => $admin['name']]);
    } catch (Exception $e) {
        json_error(401, 'Unauthorized');
    }
}

// ── Admin Stats ──────────────────────────────────────────────────────────────

function routeAdminStats(PDO $pdo): void {
    $totalReq     = $pdo->query("SELECT COUNT(*) FROM service_requests")->fetchColumn();
    $pendingReq   = $pdo->query("SELECT COUNT(*) FROM service_requests WHERE status='pending'")->fetchColumn();
    $inProgressReq= $pdo->query("SELECT COUNT(*) FROM service_requests WHERE status='in_progress'")->fetchColumn();
    $completedReq = $pdo->query("SELECT COUNT(*) FROM service_requests WHERE status='completed'")->fetchColumn();
    $totalConv    = $pdo->query("SELECT COUNT(*) FROM conversations")->fetchColumn();
    $openConv     = $pdo->query("SELECT COUNT(*) FROM conversations WHERE status='open'")->fetchColumn();
    $unreadNotif  = $pdo->query("SELECT COUNT(*) FROM notifications WHERE is_read=0")->fetchColumn();
    $recentRows   = $pdo->query("SELECT * FROM service_requests ORDER BY created_at DESC LIMIT 5")->fetchAll();

    json_out([
        'totalRequests'       => (int)$totalReq,
        'pendingRequests'     => (int)$pendingReq,
        'inProgressRequests'  => (int)$inProgressReq,
        'completedRequests'   => (int)$completedReq,
        'totalConversations'  => (int)$totalConv,
        'openConversations'   => (int)$openConv,
        'unreadNotifications' => (int)$unreadNotif,
        'recentRequests'      => array_map('castServiceRequest', $recentRows),
    ]);
}

// ── Generic list ─────────────────────────────────────────────────────────────

function routeList(PDO $pdo, string $table, string $order): void {
    $rows = $pdo->query("SELECT * FROM {$table} ORDER BY {$order}")->fetchAll();
    $cast = 'cast' . str_replace('_', '', ucwords($table, '_'));
    if (function_exists($cast)) {
        $rows = array_map($cast, $rows);
    }
    json_out($rows);
}

function routeDelete(PDO $pdo, string $table, int $id): void {
    $pdo->prepare("DELETE FROM {$table} WHERE id=?")->execute([$id]);
    http_response_code(204);
    exit;
}

// ── Slides ───────────────────────────────────────────────────────────────────

function routeSlidesCreate(PDO $pdo, array $b): void {
    $now = now();
    $pdo->prepare("INSERT INTO hero_slides (title,subtitle,image_url,cta_text,\"order\",is_active,created_at)
                   VALUES (?,?,?,?,?,?,?)")
        ->execute([$b['title'],$b['subtitle'],$b['imageUrl'],$b['ctaText']??null,(int)($b['order']??0),(int)(bool)($b['isActive']??true),$now]);
    $id = $pdo->lastInsertId();
    $row = $pdo->query("SELECT * FROM hero_slides WHERE id={$id}")->fetch();
    http_response_code(201);
    json_out(castHeorslides($row));
}
function routeSlidesUpdate(PDO $pdo, int $id, array $b): void {
    $pdo->prepare("UPDATE hero_slides SET title=?,subtitle=?,image_url=?,cta_text=?,\"order\"=?,is_active=? WHERE id=?")
        ->execute([$b['title']??null,$b['subtitle']??null,$b['imageUrl']??null,$b['ctaText']??null,
                   isset($b['order'])?(int)$b['order']:null,isset($b['isActive'])?(int)(bool)$b['isActive']:null,$id]);
    $row = $pdo->query("SELECT * FROM hero_slides WHERE id={$id}")->fetch();
    if (!$row) json_error(404,'Not found');
    json_out(castHeorslides($row));
}
function castHeorslides(array $r): array {
    return ['id'=>(int)$r['id'],'title'=>$r['title'],'subtitle'=>$r['subtitle'],
            'imageUrl'=>$r['image_url'],'ctaText'=>$r['cta_text'],'order'=>(int)$r['order'],
            'isActive'=>(bool)$r['is_active'],'createdAt'=>$r['created_at']];
}
// alias
function castHeroslides(array $r): array { return castHeorslides($r); }

// ── Services ─────────────────────────────────────────────────────────────────

function routeServicesCreate(PDO $pdo, array $b): void {
    $pdo->prepare("INSERT INTO services (title,description,icon,image_url,\"order\",is_active) VALUES (?,?,?,?,?,?)")
        ->execute([$b['title'],$b['description'],$b['icon'],$b['imageUrl']??null,(int)($b['order']??0),(int)(bool)($b['isActive']??true)]);
    $id = $pdo->lastInsertId();
    $row = $pdo->query("SELECT * FROM services WHERE id={$id}")->fetch();
    http_response_code(201);
    json_out(castServices($row));
}
function routeServicesUpdate(PDO $pdo, int $id, array $b): void {
    $pdo->prepare("UPDATE services SET title=?,description=?,icon=?,image_url=?,\"order\"=?,is_active=? WHERE id=?")
        ->execute([$b['title']??null,$b['description']??null,$b['icon']??null,$b['imageUrl']??null,
                   isset($b['order'])?(int)$b['order']:null,isset($b['isActive'])?(int)(bool)$b['isActive']:null,$id]);
    $row = $pdo->query("SELECT * FROM services WHERE id={$id}")->fetch();
    if (!$row) json_error(404,'Not found');
    json_out(castServices($row));
}
function castServices(array $r): array {
    return ['id'=>(int)$r['id'],'title'=>$r['title'],'description'=>$r['description'],
            'icon'=>$r['icon'],'imageUrl'=>$r['image_url'],'order'=>(int)$r['order'],'isActive'=>(bool)$r['is_active']];
}

// ── Containers ───────────────────────────────────────────────────────────────

function routeContainersList(PDO $pdo): void {
    $rows = $pdo->query("SELECT * FROM containers ORDER BY \"order\" ASC")->fetchAll();
    json_out(array_map('castContainers', $rows));
}
function routeContainersCreate(PDO $pdo, array $b): void {
    $features = is_array($b['features']??null) ? json_encode($b['features'],JSON_UNESCAPED_UNICODE) : '[]';
    $pdo->prepare("INSERT INTO containers (name,size,capacity,description,features,price_per_day,image_url,\"order\",is_active)
                   VALUES (?,?,?,?,?,?,?,?,?)")
        ->execute([$b['name'],$b['size'],$b['capacity'],$b['description'],$features,
                   (float)($b['pricePerDay']??0),$b['imageUrl']??null,(int)($b['order']??0),(int)(bool)($b['isActive']??true)]);
    $id = $pdo->lastInsertId();
    $row = $pdo->query("SELECT * FROM containers WHERE id={$id}")->fetch();
    http_response_code(201);
    json_out(castContainers($row));
}
function routeContainersUpdate(PDO $pdo, int $id, array $b): void {
    $existing = $pdo->query("SELECT * FROM containers WHERE id={$id}")->fetch();
    if (!$existing) json_error(404,'Not found');
    $features = isset($b['features']) ? json_encode($b['features'],JSON_UNESCAPED_UNICODE) : $existing['features'];
    $pdo->prepare("UPDATE containers SET name=?,size=?,capacity=?,description=?,features=?,price_per_day=?,image_url=?,\"order\"=?,is_active=? WHERE id=?")
        ->execute([$b['name']??$existing['name'],$b['size']??$existing['size'],$b['capacity']??$existing['capacity'],
                   $b['description']??$existing['description'],$features,
                   isset($b['pricePerDay'])?(float)$b['pricePerDay']:(float)$existing['price_per_day'],
                   $b['imageUrl']??$existing['image_url'],isset($b['order'])?(int)$b['order']:(int)$existing['order'],
                   isset($b['isActive'])?(int)(bool)$b['isActive']:(int)$existing['is_active'],$id]);
    $row = $pdo->query("SELECT * FROM containers WHERE id={$id}")->fetch();
    json_out(castContainers($row));
}
function castContainers(array $r): array {
    return ['id'=>(int)$r['id'],'name'=>$r['name'],'size'=>$r['size'],'capacity'=>$r['capacity'],
            'description'=>$r['description'],'features'=>json_decode($r['features'],true)??[],
            'pricePerDay'=>(float)$r['price_per_day'],'imageUrl'=>$r['image_url'],
            'order'=>(int)$r['order'],'isActive'=>(bool)$r['is_active']];
}

// ── Partners ─────────────────────────────────────────────────────────────────

function routePartnersCreate(PDO $pdo, array $b): void {
    $pdo->prepare("INSERT INTO partners (name,logo_url,website_url,\"order\",is_active) VALUES (?,?,?,?,?)")
        ->execute([$b['name'],$b['logoUrl'],$b['websiteUrl']??null,(int)($b['order']??0),(int)(bool)($b['isActive']??true)]);
    $id = $pdo->lastInsertId();
    $row = $pdo->query("SELECT * FROM partners WHERE id={$id}")->fetch();
    http_response_code(201);
    json_out(castPartners($row));
}
function routePartnersUpdate(PDO $pdo, int $id, array $b): void {
    $pdo->prepare("UPDATE partners SET name=?,logo_url=?,website_url=?,\"order\"=?,is_active=? WHERE id=?")
        ->execute([$b['name']??null,$b['logoUrl']??null,$b['websiteUrl']??null,
                   isset($b['order'])?(int)$b['order']:null,isset($b['isActive'])?(int)(bool)$b['isActive']:null,$id]);
    $row = $pdo->query("SELECT * FROM partners WHERE id={$id}")->fetch();
    if (!$row) json_error(404,'Not found');
    json_out(castPartners($row));
}
function castPartners(array $r): array {
    return ['id'=>(int)$r['id'],'name'=>$r['name'],'logoUrl'=>$r['logo_url'],
            'websiteUrl'=>$r['website_url'],'order'=>(int)$r['order'],'isActive'=>(bool)$r['is_active']];
}

// ── Testimonials ─────────────────────────────────────────────────────────────

function routeTestimonialsCreate(PDO $pdo, array $b): void {
    $now = now();
    $pdo->prepare("INSERT INTO testimonials (client_name,company,content,rating,avatar_url,is_active,created_at) VALUES (?,?,?,?,?,?,?)")
        ->execute([$b['clientName'],$b['company'],$b['content'],(int)($b['rating']??5),$b['avatarUrl']??null,(int)(bool)($b['isActive']??true),$now]);
    $id = $pdo->lastInsertId();
    $row = $pdo->query("SELECT * FROM testimonials WHERE id={$id}")->fetch();
    http_response_code(201);
    json_out(castTestimonials($row));
}
function routeTestimonialsUpdate(PDO $pdo, int $id, array $b): void {
    $pdo->prepare("UPDATE testimonials SET client_name=?,company=?,content=?,rating=?,avatar_url=?,is_active=? WHERE id=?")
        ->execute([$b['clientName']??null,$b['company']??null,$b['content']??null,
                   isset($b['rating'])?(int)$b['rating']:null,$b['avatarUrl']??null,
                   isset($b['isActive'])?(int)(bool)$b['isActive']:null,$id]);
    $row = $pdo->query("SELECT * FROM testimonials WHERE id={$id}")->fetch();
    if (!$row) json_error(404,'Not found');
    json_out(castTestimonials($row));
}
function castTestimonials(array $r): array {
    return ['id'=>(int)$r['id'],'clientName'=>$r['client_name'],'company'=>$r['company'],
            'content'=>$r['content'],'rating'=>(int)$r['rating'],'avatarUrl'=>$r['avatar_url'],
            'isActive'=>(bool)$r['is_active'],'createdAt'=>$r['created_at']];
}

// ── Company Values ────────────────────────────────────────────────────────────

function routeValuesCreate(PDO $pdo, array $b): void {
    $pdo->prepare("INSERT INTO company_values (title,description,icon,\"order\") VALUES (?,?,?,?)")
        ->execute([$b['title'],$b['description'],$b['icon'],(int)($b['order']??0)]);
    $id = $pdo->lastInsertId();
    $row = $pdo->query("SELECT * FROM company_values WHERE id={$id}")->fetch();
    http_response_code(201);
    json_out(castCompanyvalues($row));
}
function routeValuesUpdate(PDO $pdo, int $id, array $b): void {
    $pdo->prepare("UPDATE company_values SET title=?,description=?,icon=?,\"order\"=? WHERE id=?")
        ->execute([$b['title']??null,$b['description']??null,$b['icon']??null,isset($b['order'])?(int)$b['order']:null,$id]);
    $row = $pdo->query("SELECT * FROM company_values WHERE id={$id}")->fetch();
    if (!$row) json_error(404,'Not found');
    json_out(castCompanyvalues($row));
}
function castCompanyvalues(array $r): array {
    return ['id'=>(int)$r['id'],'title'=>$r['title'],'description'=>$r['description'],
            'icon'=>$r['icon'],'order'=>(int)$r['order']];
}

// ── Service Requests ─────────────────────────────────────────────────────────

function routeServiceRequestsList(PDO $pdo): void {
    $status = $_GET['status'] ?? null;
    if ($status) {
        $stmt = $pdo->prepare("SELECT * FROM service_requests WHERE status=? ORDER BY created_at DESC");
        $stmt->execute([$status]);
    } else {
        $stmt = $pdo->query("SELECT * FROM service_requests ORDER BY created_at DESC");
    }
    json_out(array_map('castServiceRequest', $stmt->fetchAll()));
}
function routeServiceRequestsCreate(PDO $pdo, array $b): void {
    $now = now();
    $pdo->prepare("INSERT INTO service_requests (client_name,phone,email,service_type,container_size,location,duration,notes,status,created_at,updated_at)
                   VALUES (?,?,?,?,?,?,?,?,'pending',?,?)")
        ->execute([$b['clientName'],$b['phone'],$b['email']??null,$b['serviceType'],$b['containerSize']??'',
                   $b['location'],$b['duration']??null,$b['notes']??null,$now,$now]);
    $id = $pdo->lastInsertId();
    $row = $pdo->query("SELECT * FROM service_requests WHERE id={$id}")->fetch();
    // Create notification
    $pdo->prepare("INSERT INTO notifications (title,message,type,ref_id,ref_type,is_read,created_at) VALUES (?,?,?,?,?,0,?)")
        ->execute(['طلب خدمة جديد','تم استلام طلب جديد من '.$b['clientName'],'service_request',$id,'service_request',$now]);
    http_response_code(201);
    json_out(castServiceRequest($row));
}
function routeServiceRequestsUpdate(PDO $pdo, int $id, array $b): void {
    $now = now();
    $pdo->prepare("UPDATE service_requests SET status=?,admin_notes=?,updated_at=? WHERE id=?")
        ->execute([$b['status']??null,$b['adminNotes']??null,$now,$id]);
    $row = $pdo->query("SELECT * FROM service_requests WHERE id={$id}")->fetch();
    if (!$row) json_error(404,'Not found');
    json_out(castServiceRequest($row));
}
function castServiceRequest(array $r): array {
    return ['id'=>(int)$r['id'],'clientName'=>$r['client_name'],'phone'=>$r['phone'],
            'email'=>$r['email'],'serviceType'=>$r['service_type'],'containerSize'=>$r['container_size'],
            'location'=>$r['location'],'duration'=>$r['duration'],'notes'=>$r['notes'],
            'status'=>$r['status'],'adminNotes'=>$r['admin_notes'],
            'createdAt'=>$r['created_at'],'updatedAt'=>$r['updated_at']];
}

// ── Notifications ─────────────────────────────────────────────────────────────

function castNotifications(array $r): array { return castNotification($r); }
function castNotification(array $r): array {
    return ['id'=>(int)$r['id'],'title'=>$r['title'],'message'=>$r['message'],
            'type'=>$r['type'],'isRead'=>(bool)$r['is_read'],'refId'=>isset($r['ref_id'])?(int)$r['ref_id']:null,
            'refType'=>$r['ref_type']??null,'createdAt'=>$r['created_at']];
}

// ── Conversations ─────────────────────────────────────────────────────────────

function routeConversationsCreate(PDO $pdo, array $b): void {
    $now = now();
    $pdo->prepare("INSERT INTO conversations (client_name,phone,email,subject,status,unread_count,created_at,updated_at)
                   VALUES (?,?,?,?,'open',0,?,?)")
        ->execute([$b['clientName'],$b['phone']??null,$b['email']??null,$b['subject']??null,$now,$now]);
    $id = $pdo->lastInsertId();
    $row = $pdo->query("SELECT * FROM conversations WHERE id={$id}")->fetch();
    $pdo->prepare("INSERT INTO notifications (title,message,type,ref_id,ref_type,is_read,created_at) VALUES (?,?,?,?,?,0,?)")
        ->execute(['محادثة جديدة','بدأ '.$b['clientName'].' محادثة جديدة','chat',$id,'conversation',$now]);
    http_response_code(201);
    json_out(castConversation($row));
}
function routeConversationsUpdate(PDO $pdo, int $id, array $b): void {
    $now = now();
    $pdo->prepare("UPDATE conversations SET status=?,updated_at=? WHERE id=?")->execute([$b['status']??null,$now,$id]);
    $row = $pdo->query("SELECT * FROM conversations WHERE id={$id}")->fetch();
    if (!$row) json_error(404,'Not found');
    json_out(castConversation($row));
}
function routeConversationMessages(PDO $pdo, int $id): void {
    $stmt = $pdo->prepare("SELECT * FROM messages WHERE conversation_id=? ORDER BY created_at ASC");
    $stmt->execute([$id]);
    $msgs = $stmt->fetchAll();
    // Mark as read & reset unread
    $pdo->prepare("UPDATE messages SET is_read='true' WHERE conversation_id=?")->execute([$id]);
    $pdo->prepare("UPDATE conversations SET unread_count=0 WHERE id=?")->execute([$id]);
    json_out(array_map('castMessage', $msgs));
}
function routeConversationMessageCreate(PDO $pdo, int $id, array $b): void {
    $now  = now();
    $type = $b['senderType'] ?? 'client';
    $pdo->prepare("INSERT INTO messages (conversation_id,content,sender_type,is_read,created_at) VALUES (?,?,?,'false',?)")
        ->execute([$id,$b['content'],$type,$now]);
    $msgId = $pdo->lastInsertId();
    // Update conversation
    if ($type === 'client') {
        $pdo->prepare("UPDATE conversations SET last_message=?,updated_at=?,unread_count=unread_count+1 WHERE id=?")
            ->execute([$b['content'],$now,$id]);
    } else {
        $pdo->prepare("UPDATE conversations SET last_message=?,updated_at=? WHERE id=?")
            ->execute([$b['content'],$now,$id]);
    }
    $row = $pdo->query("SELECT * FROM messages WHERE id={$msgId}")->fetch();
    http_response_code(201);
    json_out(castMessage($row));
}
function castConversations(array $r): array { return castConversation($r); }
function castConversation(array $r): array {
    return ['id'=>(int)$r['id'],'clientName'=>$r['client_name'],'phone'=>$r['phone'],
            'email'=>$r['email'],'subject'=>$r['subject'],'status'=>$r['status'],
            'lastMessage'=>$r['last_message']??null,'unreadCount'=>(int)$r['unread_count'],
            'createdAt'=>$r['created_at'],'updatedAt'=>$r['updated_at']];
}
function castMessage(array $r): array {
    return ['id'=>(int)$r['id'],'conversationId'=>(int)$r['conversation_id'],'content'=>$r['content'],
            'senderType'=>$r['sender_type'],'isRead'=>$r['is_read']==='true','createdAt'=>$r['created_at']];
}

// ═══════════════════════════════════════════════════════════════════════════
// ─── AI CHAT ─────────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════

function aiNormalize(string $text): string {
    $patterns = ['/\b(ابغى|ابي|أبغى|أبي|ودي|اريد)\b/u'=>'أريد','/\bوين\b/u'=>'أين',
                 '/\b(وش|ايش|إيش|شو)\b/u'=>'ماذا','/\b(هلا|هلو|هاي|مرحبا)\b/u'=>'مرحباً',
                 '/\b(مشكور|يعطيك العافية|يسلمك|مشكورين)\b/u'=>'شكراً',
                 '/\b(زين|تمام|ماشي|اوكي|اوك|اوكيه|صح|آخدها|خذها)\b/u'=>'نعم',
                 '/\b(امتى|وقتاش)\b/u'=>'متى','/\b(بكم|يكم|بكام)\b/u'=>'بكم',
                 '/\b(غالي|يقطع|يغلى)\b/u'=>'سعر مرتفع','/\b(رخيص|زهيد|مناسب|كويس)\b/u'=>'سعر مناسب'];
    return preg_replace(array_keys($patterns), array_values($patterns), $text);
}
function aiIntent(string $raw): string {
    $t = mb_strtolower(aiNormalize($raw));
    if (preg_match('/طلب|اطلب|أطلب|أريد|احتاج|محتاج|جهز|ابغى/', $t)) return 'order';
    if (preg_match('/سعر|أسعار|تكلفة|بكم|كلفة|فلوس|مبلغ|كم الحاوية|كم تكلف/', $t)) return 'prices';
    if (preg_match('/خدمات|خدمه|الخدمات|وش عندكم|إيش عندكم/', $t)) return 'services';
    if (preg_match('/من انتم|عن الشركة|عن الشركه|معلومات|عنكم/', $t)) return 'about';
    if (preg_match('/تواصل|اتصل|رقم|هاتف|جوال|كلمني/', $t)) return 'contact';
    if (preg_match('/مرحب|السلام|صباح|مساء|كيف حالك|كيفك/', $t)) return 'greeting';
    if (preg_match('/شكر|مشكور|يعطيك/', $t)) return 'thanks';
    if (preg_match('/نعم|موافق|تأكيد|تأكد|ارسل|يلا|حلو|صح|ماشي|اوكي|اكيد|تمام|زين/', $t)) return 'confirm';
    if (preg_match('/لا |رجوع|رجع|تعديل|تغيير|غير|مش|بدل/', $t)) return 'cancel';
    return 'unknown';
}
function aiDetectService(string $text): ?string {
    $t = mb_strtolower($text);
    if (preg_match('/حاوي|ايجار|تأجير|container/', $t)) return 'container_rental';
    if (preg_match('/نقل|انقاض|أنقاض|ردم|مخلفات/', $t)) return 'debris_transport';
    if (preg_match('/مصنع|ورش|ورشة|صناعي/', $t)) return 'factory';
    if (preg_match('/بيئ|صديق للبيئة/', $t)) return 'environmental';
    return null;
}
function aiDetectContainer(string $text): ?string {
    $t = mb_strtolower($text);
    if (preg_match('/12|صغير|صغيره|ترميم|منزل|بيت|سكن/', $t)) return 'small_12';
    if (preg_match('/20|متوسط|متوسطه|تجاري/', $t)) return 'medium_20';
    if (preg_match('/30|مصنع|ورش|صناعي/', $t)) return 'factory_30';
    if (preg_match('/40|كبير|كبيره|ضخم|ضخمة/', $t)) return 'large_40';
    return null;
}
function aiWelcome(): array {
    global $AI_SERVICES;
    return ['reply'=>"أهلاً وسهلاً! 👋 أنا المساعد الذكي لـ **سبائك الماسة** — متخصصون في تأجير الحاويات ونقل الأنقاض بالرياض منذ 2018.\n\nكيف أقدر أساعدك اليوم؟",
            'messageType'=>'options',
            'options'=>[['label'=>'اطلب خدمة الآن','value'=>'order','emoji'=>'📦'],['label'=>'عرض الأسعار','value'=>'prices','emoji'=>'💰'],
                        ['label'=>'خدماتنا','value'=>'services','emoji'=>'🛠️'],['label'=>'من نحن','value'=>'about','emoji'=>'ℹ️'],
                        ['label'=>'تواصل معنا','value'=>'contact','emoji'=>'📞']],
            'flowState'=>['step'=>'main_menu','data'=>new stdClass]];
}
function aiGoToService(string $sid, array $data): array {
    global $AI_CONTAINERS;
    if ($sid === 'container_rental') {
        return ['reply'=>'اختر حجم الحاوية المناسب لمشروعك 👇','messageType'=>'container_cards','cards'=>$AI_CONTAINERS,
                'flowState'=>['step'=>'container_select','data'=>array_merge($data,['serviceType'=>'تأجير حاويات'])]];
    }
    $names=['debris_transport'=>'نقل الأنقاض والردم','factory'=>'خدمات المصانع والورش','environmental'=>'الحلول البيئية'];
    $n=$names[$sid]??'غير محدد';
    return ['reply'=>"ممتاز! اخترت **{$n}** 👍\n\nوين الموقع اللي تحتاج الخدمة فيه؟\nأرسل العنوان أو رابط الموقع من قوقل ماب 📍",
            'messageType'=>'text','flowState'=>['step'=>'collect_location','data'=>array_merge($data,['serviceType'=>$n])]];
}
function aiProcess(PDO $pdo, string $msg, array $state): array {
    global $AI_SERVICES, $AI_CONTAINERS;
    $intent = aiIntent($msg);
    $step   = $state['step'] ?? 'welcome';
    $data   = (array)($state['data'] ?? []);
    $t      = mb_strtolower($msg);

    if (in_array(trim(mb_strtolower($msg)), ['القائمة الرئيسية','menu','رئيسية','البداية'])) return aiWelcome();

    // Global intents work from any step except when actively collecting data
    $collectingSteps = ['collect_location','collect_name','collect_phone','confirm'];
    if (!in_array($step, $collectingSteps)) {
        if ($intent==='about') {
            return ['reply'=>"🏢 **مؤسسة سبائك الماسة لتأجير الحاويات**\n\n📅 التأسيس: 2018 — الرياض\n📋 السجل التجاري: 7010655533\n⭐ خبرة +6 سنوات\n✅ +500 مشروع منجز\n\nمتخصصون في تأجير حاويات المخلفات ونقل الأنقاض للمشاريع السكنية والتجارية والصناعية في مدينة الرياض.",
                    'messageType'=>'options','flowState'=>['step'=>'main_menu','data'=>new stdClass],
                    'options'=>[['label'=>'اطلب خدمة','value'=>'order','emoji'=>'📦'],['label'=>'شوف الأسعار','value'=>'prices','emoji'=>'💰'],['label'=>'تواصل معنا','value'=>'contact','emoji'=>'📞']]];
        }
        if ($intent==='contact') {
            return ['reply'=>"📞 **بياناتنا للتواصل:**\n\n☎️ 0555888767\n☎️ 0580595555\n✉️ info@sabaik.net\n📍 الرياض، المملكة العربية السعودية\n\nأو اطلب خدمتك الآن من هنا! ⬇️",
                    'messageType'=>'options','flowState'=>['step'=>'main_menu','data'=>new stdClass],
                    'options'=>[['label'=>'اطلب خدمة الآن','value'=>'order','emoji'=>'📦'],['label'=>'رجوع للقائمة','value'=>'menu','emoji'=>'🏠']]];
        }
        if ($intent==='prices') {
            return ['reply'=>'💰 أسعارنا الشفافة والتنافسية — كل حاوية بمواصفاتها:','messageType'=>'container_cards','cards'=>$AI_CONTAINERS,
                    'flowState'=>['step'=>'main_menu','data'=>new stdClass],'options'=>[['label'=>'اطلب الآن','value'=>'order','emoji'=>'📦'],['label'=>'رجوع للقائمة','value'=>'menu','emoji'=>'🏠']]];
        }
        if ($intent==='thanks') {
            return ['reply'=>'العفو! يسعدنا خدمتك دائماً 😊 في شي آخر أقدر أساعدك فيه؟','messageType'=>'options',
                    'flowState'=>['step'=>'main_menu','data'=>new stdClass],'options'=>[['label'=>'اطلب خدمة','value'=>'order','emoji'=>'📦'],['label'=>'لا، شكراً','value'=>'done','emoji'=>'✅']]];
        }
    }

    switch ($step) {
        case 'welcome':
        case 'main_menu':
            $svc = aiDetectService($msg);
            if ($svc) return aiGoToService($svc, $data);
            if ($intent==='order'||$intent==='services') {
                return ['reply'=>'ممتاز! 💪 اختر الخدمة اللي تحتاجها:','messageType'=>'service_cards','cards'=>$AI_SERVICES,'flowState'=>['step'=>'service_type','data'=>new stdClass]];
            }
            if ($intent==='prices') {
                return ['reply'=>'💰 أسعارنا الشفافة والتنافسية — كل حاوية بمواصفاتها:','messageType'=>'container_cards','cards'=>$AI_CONTAINERS,
                        'flowState'=>['step'=>'main_menu','data'=>new stdClass],'options'=>[['label'=>'اطلب الآن','value'=>'order','emoji'=>'📦'],['label'=>'رجوع للقائمة','value'=>'menu','emoji'=>'🏠']]];
            }
            if ($intent==='about') {
                return ['reply'=>"**سبائك الماسة** 💎\n\nمؤسسة سعودية متخصصة في:\n📦 تأجير حاويات المخلفات\n🚛 نقل الأنقاض والردم\n🏭 خدمات المصانع والورش\n🌿 الحلول البيئية\n\nتأسست 2018 في الرياض. نفخر بخدمة المشاريع الكبرى والصغيرة بكفاءة واحترافية عالية.",
                        'messageType'=>'text','flowState'=>['step'=>'main_menu','data'=>new stdClass],
                        'options'=>[['label'=>'اطلب خدمة','value'=>'order','emoji'=>'📦'],['label'=>'تواصل معنا','value'=>'contact','emoji'=>'📞']]];
            }
            if ($intent==='contact') {
                return ['reply'=>"📞 **تواصل معنا**\n\nجوال / واتساب: **0501234567**\nالبريد: info@sabaik-almasa.com\nالموقع: الرياض، المملكة العربية السعودية\n\nأو اطلب خدمتك مباشرة من هنا وسنتواصل معك فوراً! 👇",
                        'messageType'=>'options','flowState'=>['step'=>'main_menu','data'=>new stdClass],
                        'options'=>[['label'=>'اطلب خدمة الآن','value'=>'order','emoji'=>'📦']]];
            }
            if ($intent==='greeting') {
                return array_merge(aiWelcome(),['reply'=>"أهلاً وسهلاً! 😊\n\n".aiWelcome()['reply']]);
            }
            if ($intent==='thanks') {
                return ['reply'=>"العفو! 😊 سعدنا بخدمتك. هل تحتاج شيئاً آخر؟",'messageType'=>'options',
                        'flowState'=>['step'=>'main_menu','data'=>new stdClass],'options'=>[['label'=>'طلب جديد','value'=>'order','emoji'=>'📦'],['label'=>'القائمة الرئيسية','value'=>'menu','emoji'=>'🏠']]];
            }
            return array_merge(aiWelcome(),['reply'=>"لم أفهم قصدك تماماً 😅 يمكنني مساعدتك في:"]);

        case 'service_type':
            if (preg_match('/رجوع|رجع|تغيير|قائمة/',$t)) return aiWelcome();
            $svc = aiDetectService($msg);
            if ($svc) return aiGoToService($svc, $data);
            return ['reply'=>'اختر الخدمة اللي تحتاجها 👇','messageType'=>'service_cards','cards'=>$AI_SERVICES,'flowState'=>['step'=>'service_type','data'=>$data]];

        case 'container_select':
            if (preg_match('/رجوع|رجع|تغيير|قائمة/',$t)) {
                return ['reply'=>'اختر الخدمة اللي تحتاجها 👇','messageType'=>'service_cards','cards'=>$AI_SERVICES,'flowState'=>['step'=>'service_type','data'=>new stdClass]];
            }
            $cid = aiDetectContainer($msg);
            if ($cid) {
                $c = array_values(array_filter($AI_CONTAINERS, fn($x)=>$x['id']===$cid))[0];
                return ['reply'=>"ممتاز! اخترت **{$c['name']} - {$c['size']}** ({$c['price']} ريال/{$c['priceNote']}) 👍\n\nوين تبغى نوصل الحاوية؟\nأرسل العنوان أو رابط الموقع من قوقل ماب 📍",
                        'messageType'=>'text','flowState'=>['step'=>'collect_location','data'=>array_merge($data,['containerSize'=>"{$c['name']} - {$c['size']}",'containerPrice'=>$c['price']])]];
            }
            return ['reply'=>'اختر حجم الحاوية المناسب لمشروعك 👇','messageType'=>'container_cards','cards'=>$AI_CONTAINERS,'flowState'=>['step'=>'container_select','data'=>$data]];

        case 'collect_location':
            $loc = trim($msg);
            if (mb_strlen($loc) < 3) return ['reply'=>'الرجاء إرسال العنوان بشكل أوضح أو رابط الموقع من قوقل ماب 📍','messageType'=>'text','flowState'=>$state];
            return ['reply'=>"تم تسجيل الموقع ✅\n\nما اسمك الكريم؟",'messageType'=>'text','flowState'=>['step'=>'collect_name','data'=>array_merge($data,['location'=>$loc])]];

        case 'collect_name':
            $name = trim($msg);
            if (mb_strlen($name) < 2) return ['reply'=>'الرجاء إدخال اسمك الكريم','messageType'=>'text','flowState'=>$state];
            return ['reply'=>"أهلاً {$name}! 👋\n\nما رقم جوالك للتواصل؟\nمثال: 05XXXXXXXX",'messageType'=>'text','flowState'=>['step'=>'collect_phone','data'=>array_merge($data,['name'=>$name])]];

        case 'collect_phone':
            $phone = preg_replace('/[\s\-]/','',$msg);
            if (mb_strlen($phone) < 9) return ['reply'=>'الرجاء إدخال رقم جوال صحيح (مثال: 0555888767)','messageType'=>'text','flowState'=>$state];
            return ['reply'=>'ممتاز! راجع طلبك وأكده 👇','messageType'=>'order_confirm',
                    'orderData'=>['serviceType'=>$data['serviceType']??null,'containerSize'=>$data['containerSize']??null,'containerPrice'=>$data['containerPrice']??null,'location'=>$data['location']??null,'name'=>$data['name']??null,'phone'=>$phone],
                    'flowState'=>['step'=>'confirm','data'=>array_merge($data,['phone'=>$phone])]];

        case 'confirm':
            if ($intent==='confirm'||preg_match('/تأكيد|ارسل|يلا|ماشي|نعم|اوكي|موافق/',$t)) {
                $now=now();
                $pdo->prepare("INSERT INTO service_requests (client_name,phone,email,service_type,container_size,location,notes,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,'pending',?,?)")
                    ->execute([$data['name']??'غير محدد',$data['phone']??'',$data['email']??null,$data['serviceType']??'غير محدد',$data['containerSize']??'',$data['location']??'','طلب عبر البوت الذكي',$now,$now]);
                $rid=$pdo->lastInsertId();
                $pdo->prepare("INSERT INTO notifications (title,message,type,ref_id,ref_type,is_read,created_at) VALUES (?,?,?,?,?,0,?)")
                    ->execute(['🤖 طلب جديد عبر البوت الذكي',($data['name']??'').' - '.($data['serviceType']??'').' - '.($data['location']??''),'service_request',$rid,'service_request',$now]);
                return ['reply'=>'تم إرسال طلبك بنجاح! 🎉','messageType'=>'success',
                        'orderData'=>['orderId'=>(int)$rid,'phone'=>$data['phone'],'name'=>$data['name'],'serviceType'=>$data['serviceType'],'location'=>$data['location']],
                        'flowState'=>['step'=>'done','data'=>new stdClass]];
            }
            if ($intent==='cancel'||preg_match('/لا|تعديل|تغيير|رجع/',$t)) {
                return ['reply'=>'لا بأس! اختر الخدمة من جديد:','messageType'=>'service_cards','cards'=>$AI_SERVICES,'flowState'=>['step'=>'service_type','data'=>new stdClass]];
            }
            return ['reply'=>'راجع طلبك وأكده 👇','messageType'=>'order_confirm',
                    'orderData'=>['serviceType'=>$data['serviceType']??null,'containerSize'=>$data['containerSize']??null,'containerPrice'=>$data['containerPrice']??null,'location'=>$data['location']??null,'name'=>$data['name']??null,'phone'=>$data['phone']??null],
                    'flowState'=>$state];

        case 'done':
        default:
            return aiWelcome();
    }
}

function routeAiChat(PDO $pdo, array $b): void {
    $msg    = $b['message'] ?? '';
    if (!$msg) json_error(400, 'Message required');
    $convId = $b['conversationId'] ?? null;
    $raw    = $b['flowState'] ?? null;
    $state  = is_array($raw) ? $raw : (is_string($raw) ? json_decode($raw,true) : ['step'=>'welcome','data'=>new stdClass]);

    // Persist user message
    if ($convId) {
        $pdo->prepare("INSERT INTO messages (conversation_id,content,sender_type,is_read,created_at) VALUES (?,?,'client','false',?)")
            ->execute([$convId,$msg,now()]);
    }

    $response = aiProcess($pdo, $msg, $state);

    // Persist bot reply
    if ($convId) {
        $pdo->prepare("INSERT INTO messages (conversation_id,content,sender_type,is_read,created_at) VALUES (?,?,'ai','false',?)")
            ->execute([$convId,$response['reply'],now()]);
        $pdo->prepare("UPDATE conversations SET last_message=?,updated_at=? WHERE id=?")
            ->execute([$response['reply'],now(),$convId]);
    }

    json_out(array_merge($response, ['conversationId'=>$convId]));
}

// ═══════════════════════════════════════════════════════════════════════════
// ─── SCHEMA & SEED ───────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════

function initSchema(PDO $pdo): void {
    // Check if already initialized
    $tables = $pdo->query("SELECT name FROM sqlite_master WHERE type='table' AND name='admins'")->fetchColumn();
    if ($tables) return;

    $pdo->exec("
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS hero_slides (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      subtitle TEXT NOT NULL,
      image_url TEXT NOT NULL,
      cta_text TEXT,
      \"order\" INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      icon TEXT NOT NULL,
      image_url TEXT,
      \"order\" INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1
    );
    CREATE TABLE IF NOT EXISTS containers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      size TEXT NOT NULL,
      capacity TEXT NOT NULL,
      description TEXT NOT NULL,
      features TEXT NOT NULL DEFAULT '[]',
      price_per_day REAL NOT NULL,
      image_url TEXT NOT NULL,
      \"order\" INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1
    );
    CREATE TABLE IF NOT EXISTS service_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      service_type TEXT NOT NULL,
      container_size TEXT NOT NULL DEFAULT '',
      location TEXT NOT NULL,
      duration TEXT,
      notes TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      admin_notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS conversations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_name TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      subject TEXT,
      status TEXT NOT NULL DEFAULT 'open',
      last_message TEXT,
      unread_count INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      conversation_id INTEGER NOT NULL REFERENCES conversations(id),
      content TEXT NOT NULL,
      sender_type TEXT NOT NULL DEFAULT 'client',
      is_read TEXT NOT NULL DEFAULT 'false',
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'info',
      is_read INTEGER NOT NULL DEFAULT 0,
      ref_id INTEGER,
      ref_type TEXT,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS company_values (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      icon TEXT NOT NULL,
      \"order\" INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS testimonials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_name TEXT NOT NULL,
      company TEXT NOT NULL,
      content TEXT NOT NULL,
      rating INTEGER NOT NULL DEFAULT 5,
      avatar_url TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS partners (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      logo_url TEXT NOT NULL,
      website_url TEXT,
      \"order\" INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1
    );
    ");

    seedData($pdo);
}

function seedData(PDO $pdo): void {
    $now = now();
    $adminHash = hash('sha256', 'sabaik2024' . 'sabaik_salt');
    $pdo->prepare("INSERT INTO admins (username,password_hash,name,created_at) VALUES (?,?,?,?)")
        ->execute(['admin', $adminHash, 'مدير النظام', $now]);

    // Hero Slides
    $slides = [
        ['حلول ذكية لإدارة المخلفات والأنقاض','تأجير حاويات بمختلف الأحجام لمشاريع الهدم والبناء والترميم في الرياض','/images/hero-1.jpeg','اطلب خدمتك الآن',0],
        ['نقل الأنقاض بكفاءة واحترافية','أسطول متكامل من المعدات الحديثة يخدمك على مدار الساعة في جميع أنحاء الرياض','/images/hero-2.jpeg','تواصل معنا',1],
        ['شريككم الموثوق في تأجير الحاويات','منذ 2018 ونحن نقدم خدمات استثنائية تواكب رؤية المملكة 2030','/images/hero-3.jpeg','اعرف المزيد',2],
        ['بيئة نظيفة ومستدامة','نساهم في تحسين المشهد الحضري وتقليل الآثار البيئية من خلال حلول متطورة','/images/hero-4.jpeg','خدماتنا',3],
    ];
    $s=$pdo->prepare("INSERT INTO hero_slides (title,subtitle,image_url,cta_text,\"order\",is_active,created_at) VALUES (?,?,?,?,?,1,?)");
    foreach($slides as $sl) $s->execute([$sl[0],$sl[1],$sl[2],$sl[3],$sl[4],$now]);

    // Services
    $services=[
        ['تأجير حاويات مخلفات الهدم','نوفر حاويات بمختلف الأحجام لاستيعاب مخلفات الهدم والبناء، مع ضمان الالتزام بمعايير السلامة البيئية.','Box','/images/container-1.jpeg',0],
        ['نقل الأنقاض والمخلفات','خدمة نقل سريعة وآمنة للأنقاض ومواد الهدم إلى المواقع المخصصة، بأسطول حديث من الشاحنات.','Truck','/images/container-2.jpeg',1],
        ['ردم وتسوية الأراضي','خدمات ردم المواقع وتسوية الأراضي بعد أعمال الهدم، وفق المواصفات الهندسية المطلوبة.','Layers','/images/container-3.jpeg',2],
        ['تنظيف وتطهير المواقع','تنظيف شامل للمواقع الإنشائية بعد انتهاء أعمال البناء أو الهدم، مع التخلص الآمن من المخلفات.','Sparkles','/images/container-4.jpeg',3],
        ['خدمات الترميم والصيانة','ندعم مشاريع الترميم بتوفير الحاويات اللازمة ونقل المواد القديمة بكفاءة عالية.','Wrench','/images/container-1.jpeg',4],
        ['خدمات المصانع والشركات','حلول لوجستية متكاملة للمصانع والشركات الكبرى لإدارة النفايات الصناعية والمخلفات بصورة منتظمة.','Factory','/images/container-2.jpeg',5],
    ];
    $s=$pdo->prepare("INSERT INTO services (title,description,icon,image_url,\"order\",is_active) VALUES (?,?,?,?,?,1)");
    foreach($services as $sv) $s->execute([$sv[0],$sv[1],$sv[2],$sv[3],$sv[4]]);

    // Containers
    $containers=[
        ['حاوية صغيرة','4 م³','مناسبة للمنازل والمحلات','مثالية للمشاريع الصغيرة وأعمال الترميم البسيطة داخل المنازل والمحلات التجارية.',json_encode(['ترميم المنازل','المحلات التجارية الصغيرة','التعبئة والتخزين'],JSON_UNESCAPED_UNICODE),150,'/images/container-1.jpeg',0],
        ['حاوية متوسطة','8 م³','للمشاريع التجارية المتوسطة','الخيار الأمثل للمشاريع التجارية متوسطة الحجم وأعمال البناء والتشطيب.',json_encode(['أعمال البناء','التشطيب والديكور','المخازن التجارية'],JSON_UNESCAPED_UNICODE),250,'/images/container-2.jpeg',1],
        ['حاوية كبيرة','15 م³','للمشاريع الكبرى والهدم','تستوعب كميات ضخمة من المخلفات وتناسب مشاريع الهدم الكبيرة والمجمعات السكنية.',json_encode(['مشاريع الهدم الكبيرة','المجمعات السكنية','المشاريع الصناعية'],JSON_UNESCAPED_UNICODE),400,'/images/container-3.jpeg',2],
        ['حاوية صناعية','25 م³','للمصانع والمنشآت الكبيرة','مصممة خصيصاً لاحتياجات المصانع والمنشآت الصناعية الكبيرة مع تحمل أوزان ثقيلة.',json_encode(['المصانع والمعامل','المستودعات الكبيرة','النفايات الصناعية'],JSON_UNESCAPED_UNICODE),600,'/images/container-4.jpeg',3],
    ];
    $s=$pdo->prepare("INSERT INTO containers (name,size,capacity,description,features,price_per_day,image_url,\"order\",is_active) VALUES (?,?,?,?,?,?,?,?,1)");
    foreach($containers as $c) $s->execute([$c[0],$c[1],$c[2],$c[3],$c[4],$c[5],$c[6],$c[7]]);

    // Company Values
    $values=[
        ['الجودة والاحترافية','نلتزم بأعلى معايير الجودة في تقديم خدماتنا مع فريق متخصص وذو خبرة واسعة في المجال.','Award',0],
        ['الموثوقية والالتزام','نلتزم بمواعيدنا ووعودنا لعملائنا، ونضمن تنفيذ كل عملية بدقة وفي الوقت المحدد.','Shield',1],
        ['الابتكار والتطوير','نسعى دائماً لتطوير خدماتنا وتبني أحدث التقنيات والأساليب في مجال إدارة المخلفات.','Lightbulb',2],
        ['المسؤولية البيئية','نؤمن بأهمية الحفاظ على البيئة، ونلتزم بالمعايير البيئية في جميع عملياتنا.','Leaf',3],
        ['خدمة العملاء','رضا عملائنا هو أولويتنا القصوى، ونوفر دعماً متواصلاً على مدار الساعة طوال أيام الأسبوع.','HeartHandshake',4],
    ];
    $s=$pdo->prepare("INSERT INTO company_values (title,description,icon,\"order\") VALUES (?,?,?,?)");
    foreach($values as $v) $s->execute([$v[0],$v[1],$v[2],$v[3]]);

    // Testimonials
    $testimonials=[
        ['محمد العتيبي','شركة الإنشاءات الحديثة','خدمة ممتازة وسريعة، الحاويات وصلت في الوقت المحدد وكانت بحالة ممتازة. سنتعامل مع سبائك الماسة في جميع مشاريعنا القادمة.',5,$now],
        ['أحمد الغامدي','مجموعة البناء المتحدة','تعاملنا مع سبائك الماسة في مشروع هدم كبير وكانت الخدمة احترافية جداً. فريق عمل متميز وأسعار تنافسية.',5,$now],
        ['فهد السهلي','مؤسسة الفهد للمقاولات','أنصح بشدة بالتعامل مع سبائك الماسة. الخدمة سريعة والفريق متعاون جداً والأسعار معقولة.',4,$now],
        ['خالد المطيري','شركة المطيري للإنشاءات','استأجرنا حاويات متعددة لمشروع سكني كبير. الخدمة كانت على أعلى مستوى والتوصيل في الوقت المحدد دائماً.',5,$now],
        ['عبدالله الدوسري','مجموعة الدوسري العقارية','سبائك الماسة من أفضل شركات تأجير الحاويات في الرياض. خدمة متكاملة وسعر عادل.',4,$now],
    ];
    $s=$pdo->prepare("INSERT INTO testimonials (client_name,company,content,rating,is_active,created_at) VALUES (?,?,?,?,1,?)");
    foreach($testimonials as $t) $s->execute([$t[0],$t[1],$t[2],$t[3],$t[4]]);

    // Partners
    for($i=1;$i<=6;$i++) {
        $pdo->prepare("INSERT INTO partners (name,logo_url,\"order\",is_active) VALUES (?,?,?,1)")
            ->execute(["شريك النجاح {$i}","/images/partner-{$i}.jpg",$i-1]);
    }

    // Notifications
    $pdo->prepare("INSERT INTO notifications (title,message,type,is_read,created_at) VALUES (?,?,?,0,?)")
        ->execute(['طلب جديد','تم استلام طلب خدمة جديد من العميل أحمد محمد','request',$now]);
    $pdo->prepare("INSERT INTO notifications (title,message,type,is_read,created_at) VALUES (?,?,?,0,?)")
        ->execute(['مرحباً بك في لوحة الإدارة','تم تجهيز النظام بالبيانات الأولية. يمكنك الآن إدارة جميع أقسام الموقع.','system',$now]);
}

// ═══════════════════════════════════════════════════════════════════════════
// ─── HELPERS ─────────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════

function now(): string { return (new DateTime('now', new DateTimeZone('Asia/Riyadh')))->format(DateTime::ATOM); }

function json_out(mixed $data): void {
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}
function json_error(int $code, string $msg): void {
    http_response_code($code);
    echo json_encode(['error' => $msg], JSON_UNESCAPED_UNICODE);
    exit;
}
