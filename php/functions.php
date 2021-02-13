<?php
  // With microtime we get the current date in microseconds. Setting it to true brings back a float instead of a string
  $executionStartTime = microtime(true) / 1000;

  // Url for the API we are using
  $url = 'http://api.geonames.org/findNearbyPlaceNameJSON';

  // Storing our parameters (lat, long and username) in the $query_fields variable
  $query_fields = [
    'lat' => $_REQUEST['lat'],
    'lng' => $_REQUEST['lng'], 
    'username' => 'pez_gordo',           
  ];
   
  // We initiate curl
  $curl = curl_init($url . '?' . http_build_query($query_fields));
  // Setting CURLOPT_RETURNTRANSFER to true it brings back the result of the transfer as a string instead of showing it directly
  curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
  // We decode our JSON string with json_decode
  $response = json_decode(curl_exec($curl), true);
  // Terminate curl
  curl_close($curl);	

  //Appends request info to result
	$output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['description'] = "mission saved";
  $output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
  
  $output['data'] = $response['geonames'];
    
	// We set the file header to the correct type for the client browser
	header('Content-Type: application/json; charset=UTF-8');
  // We use json_encode to de-serialize to JSON and send the results
	echo json_encode($output); 

?>
