<?php
// Get Events API - Backend for retrieving events
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

// Get category filter (optional)
$category = isset($_GET['category']) ? htmlspecialchars(strip_tags($_GET['category'])) : null;
$eventId = isset($_GET['id']) ? htmlspecialchars(strip_tags($_GET['id'])) : null;

// Load events from file
$eventsFile = __DIR__ . '/../data/events.json';
$events = [];

if (file_exists($eventsFile)) {
    $eventsJson = file_get_contents($eventsFile);
    $events = json_decode($eventsJson, true) ?: [];
}

// Filter by category if specified
if ($category) {
    $events = array_filter($events, function($event) use ($category) {
        return isset($event['category']) && $event['category'] === $category;
    });
    $events = array_values($events); // Reindex array
}

// Get single event by ID if specified
if ($eventId) {
    $event = null;
    foreach ($events as $e) {
        if (isset($e['id']) && $e['id'] === $eventId) {
            $event = $e;
            break;
        }
    }
    
    if ($event) {
        http_response_code(200);
        echo json_encode($event);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Event not found']);
    }
    exit();
}

// Return all events (or filtered)
http_response_code(200);
echo json_encode($events);

