<?php
// Save Event API - Backend for storing events
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow POST requests for saving
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

// Get JSON input
$input = file_get_contents('php://input');
$data = json_decode($input, true);

// Validate required fields
$requiredFields = ['title', 'organizer', 'date', 'time', 'location', 'description', 'email'];
foreach ($requiredFields as $field) {
    if (!isset($data[$field]) || empty($data[$field])) {
        http_response_code(400);
        echo json_encode(['error' => "Missing required field: $field"]);
        exit();
    }
}

// Validate email
if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid email address']);
    exit();
}

// Sanitize data
$event = [
    'id' => isset($data['id']) ? $data['id'] : time() . '_' . uniqid(),
    'title' => htmlspecialchars(strip_tags($data['title'])),
    'organizer' => htmlspecialchars(strip_tags($data['organizer'])),
    'date' => htmlspecialchars(strip_tags($data['date'])),
    'time' => htmlspecialchars(strip_tags($data['time'])),
    'location' => htmlspecialchars(strip_tags($data['location'])),
    'description' => htmlspecialchars(strip_tags($data['description'])),
    'price' => isset($data['price']) ? floatval($data['price']) : 0,
    'capacity' => isset($data['capacity']) && $data['capacity'] > 0 ? intval($data['capacity']) : null,
    'email' => filter_var($data['email'], FILTER_SANITIZE_EMAIL),
    'phone' => isset($data['phone']) ? htmlspecialchars(strip_tags($data['phone'])) : null,
    'category' => isset($data['category']) ? htmlspecialchars(strip_tags($data['category'])) : 'kids',
    'createdAt' => date('Y-m-d H:i:s')
];

// Load existing events
$eventsFile = __DIR__ . '/../data/events.json';
$eventsDir = dirname($eventsFile);

// Create data directory if it doesn't exist
if (!file_exists($eventsDir)) {
    mkdir($eventsDir, 0755, true);
}

// Load existing events
$events = [];
if (file_exists($eventsFile)) {
    $eventsJson = file_get_contents($eventsFile);
    $events = json_decode($eventsJson, true) ?: [];
}

// Add new event
$events[] = $event;

// Save events to file
file_put_contents($eventsFile, json_encode($events, JSON_PRETTY_PRINT));

// Return success response
http_response_code(201);
echo json_encode([
    'success' => true,
    'message' => 'Event created successfully',
    'event' => $event
]);

