<?php
// Delete Event API - Backend for deleting events
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow DELETE requests
if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

// Get event ID from query parameter
$eventId = isset($_GET['id']) ? htmlspecialchars(strip_tags($_GET['id'])) : null;

if (!$eventId) {
    http_response_code(400);
    echo json_encode(['error' => 'Event ID is required']);
    exit();
}

// Load events from file
$eventsFile = __DIR__ . '/../data/events.json';
$events = [];

if (file_exists($eventsFile)) {
    $eventsJson = file_get_contents($eventsFile);
    $events = json_decode($eventsJson, true) ?: [];
}

// Find and remove event
$eventFound = false;
$events = array_filter($events, function($event) use ($eventId, &$eventFound) {
    if (isset($event['id']) && $event['id'] === $eventId) {
        $eventFound = true;
        return false; // Remove this event
    }
    return true; // Keep this event
});

$events = array_values($events); // Reindex array

if (!$eventFound) {
    http_response_code(404);
    echo json_encode(['error' => 'Event not found']);
    exit();
}

// Save updated events to file
file_put_contents($eventsFile, json_encode($events, JSON_PRETTY_PRINT));

// Return success response
http_response_code(200);
echo json_encode([
    'success' => true,
    'message' => 'Event deleted successfully',
    'eventId' => $eventId
]);

