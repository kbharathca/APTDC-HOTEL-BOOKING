<?php
/*
Plugin Name: APTDC Haritha Hotel Booking Plugin
Plugin URI: https://tirupatihost.in/
Description: Custom functionality for hotel booking from APTDC.
Version: 1.0
Author: Bharath Kattamanchi
Author URI: https://tirupatihost.in/
*/


// Enqueue your frontend script
function haritha_hotel_booking_enqueue_script() {
    wp_enqueue_script('haritha-hotel-booking-js', plugin_dir_url(__FILE__) . 'haritha-hotel-booking.js', array('jquery'), '1.0', true);
}

// Enqueue your frontend CSS
function haritha_hotel_booking_enqueue_style() {
    wp_enqueue_style('haritha-hotel-booking-css', plugin_dir_url(__FILE__) . 'haritha-hotel-booking.css', array(), '1.0', 'all');
}

add_action('wp_enqueue_scripts', 'haritha_hotel_booking_enqueue_script');
add_action('wp_enqueue_scripts', 'haritha_hotel_booking_enqueue_style');
// Add your previous hooks and functions here


//Remove Return to Shop button

// Add the GST and updated total price to the WooCommerce session


add_filter('woocommerce_add_cart_item_data', 'add_custom_data_to_cart', 10, 3);
add_filter('woocommerce_add_cart_item_data', 'force_individual_cart_items', 10, 2);
function force_individual_cart_items($cart_item_data, $product_id) {
    $unique_cart_item_key = md5(microtime().rand());
    $cart_item_data['unique_key'] = $unique_cart_item_key;
    return $cart_item_data;
}

function add_custom_data_to_cart($cart_item_data, $product_id, $variation_id) {
    if(isset($_GET['hotel_fare'])) {
        $cart_item_data['hotel_fare'] = $_GET['hotel_fare'];
        $cart_item_data['hotel_name'] = $_GET['hotel_name'];
        $cart_item_data['room_type'] = $_GET['room_type'];
        $cart_item_data['price_per_room'] = $_GET['price_per_room'];
        $cart_item_data['tax_gst'] = $_GET['tax_gst'];
        $cart_item_data['number_of_rooms'] = $_GET['number_of_rooms'];
        $cart_item_data['checkin_date'] = $_GET['checkin_date'];
        $cart_item_data['checkout_date'] = $_GET['checkout_date'];
		if(isset($_GET['unique_id'])) {
            $cart_item_data['unique_id'] = $_GET['unique_id'];
        }
    }
   if(isset($_GET['number_of_adults'])) {
    $cart_item_data['no_of_adults'] = $_GET['number_of_adults'];
}
if(isset($_GET['number_of_children'])) {
    $cart_item_data['no_of_children'] = $_GET['number_of_children'];
}

    return $cart_item_data;
}

// Display the custom data in the cart
add_filter('woocommerce_get_item_data', 'display_custom_item_data', 10, 2);
function display_custom_item_data($item_data, $cart_item) {
    if(array_key_exists('hotel_fare', $cart_item)) {
        $item_data[] = array('name' => 'Hotel Name', 'value' => $cart_item['hotel_name']);
        $item_data[] = array('name' => 'Room Type', 'value' => $cart_item['room_type']);
        $item_data[] = array('name' => 'Price Per Room', 'value' => $cart_item['price_per_room']);
        $item_data[] = array('name' => 'Tax GST', 'value' => $cart_item['tax_gst']);
        $item_data[] = array('name' => 'Number of Rooms', 'value' => $cart_item['number_of_rooms']);
        $item_data[] = array('name' => 'Check-in Date', 'value' => $cart_item['checkin_date']);
        $item_data[] = array('name' => 'Check-out Date', 'value' => $cart_item['checkout_date']);
        $item_data[] = array('name' => 'Total Price', 'value' => $cart_item['hotel_fare']);
		if(array_key_exists('unique_id', $cart_item)) {
            $item_data[] = array('name' => 'Unique ID', 'value' => $cart_item['unique_id']);
        }
    }
    if(array_key_exists('no_of_adults', $cart_item)) {
        $item_data[] = array('name' => 'Number of Adults', 'value' => $cart_item['no_of_adults']);
    }
    if(array_key_exists('no_of_children', $cart_item)) {
        $item_data[] = array('name' => 'Number of Children', 'value' => $cart_item['no_of_children']);
    }
    return $item_data;
}
// Update the total price when the cart is loaded from the session
add_action('woocommerce_before_calculate_totals', 'update_custom_price', 20, 1);
function update_custom_price($cart_obj) {
    if (is_admin() && !defined('DOING_AJAX')) return;

    foreach ($cart_obj->get_cart() as $key => $value) {
        if (isset($value['hotel_fare'])) {
            $price = $value['hotel_fare'];
            $value['data']->set_price((float) $price);
        }
    }
}

// Add the custom data to the order
add_action('woocommerce_checkout_create_order_line_item', 'custom_checkout_create_order_line_item', 20, 4);
function custom_checkout_create_order_line_item($item, $cart_item_key, $values, $order) {
    if(array_key_exists('hotel_fare', $values)) {
        $item->add_meta_data('Hotel Name', $values['hotel_name']);
        $item->add_meta_data('Room Type', $values['room_type']);
        $item->add_meta_data('Price Per Room', $values['price_per_room']);
        $item->add_meta_data('Tax GST', $values['tax_gst']);
        $item->add_meta_data('Number of Rooms', $values['number_of_rooms']);
        $item->add_meta_data('Check-in Date', $values['checkin_date']);
        $item->add_meta_data('Check-out Date', $values['checkout_date']);
        $item->add_meta_data('Total Price', $values['hotel_fare']);
    }
	if(array_key_exists('no_of_adults', $values)) {
        $item->add_meta_data('Number of Adults', $values['no_of_adults']);
    }
    if(array_key_exists('no_of_children', $values)) {
        $item->add_meta_data('Number of Children', $values['no_of_children']);
    }
}


// Add the custom data to WooCommerce emails
add_filter('woocommerce_email_order_meta_fields', 'custom_email_order_meta_fields', 10, 3);
function custom_email_order_meta_fields($fields, $sent_to_admin, $order) {
    $fields['hotel_name'] = array(
        'label' => __('Hotel Name'),
        'value' => get_post_meta($order->get_id(), 'Hotel Name', true),
    );
    $fields['room_type'] = array(
        'label' => __('Room Type'),
        'value' => get_post_meta($order->get_id(), 'Room Type', true),
    );
    $fields['price_per_room'] = array(
        'label' => __('Price Per Room'),
        'value' => get_post_meta($order->get_id(), 'Price Per Room', true),
    );
    $fields['tax_gst'] = array(
        'label' => __('Tax GST'),
        'value' => get_post_meta($order->get_id(), 'Tax GST', true),
    );
    $fields['number_of_rooms'] = array(
        'label' => __('Number of Rooms'),
        'value' => get_post_meta($order->get_id(), 'Number of Rooms', true),
    );
    $fields['checkin_date'] = array(
        'label' => __('Check-in Date'),
        'value' => get_post_meta($order->get_id(), 'Check-in Date', true),
    );
    $fields['checkout_date'] = array(
        'label' => __('Check-out Date'),
        'value' => get_post_meta($order->get_id(), 'Check-out Date', true),
    );
    $fields['total_price'] = array(
        'label' => __('Total Price'),
        'value' => get_post_meta($order->get_id(), 'Total Price', true),
    );
    $fields['no_of_adults'] = array(
        'label' => __('Number of Adults'),
        'value' => get_post_meta($order->get_id(), 'Number of Adults', true),
    );
    $fields['no_of_children'] = array(
        'label' => __('Number of Children'),
        'value' => get_post_meta($order->get_id(), 'Number of Children', true),
    );
    return $fields;
}
//add times to cart items

function add_times_to_cart_item_data( $cart_item_data, $product_id, $variation_id ) {
    if( isset( $_GET['checkin_time'] ) ) {
        $cart_item_data['checkin_time'] = sanitize_text_field( $_GET['checkin_time'] );
    }
    if( isset( $_GET['checkout_time'] ) ) {
        $cart_item_data['checkout_time'] = sanitize_text_field( $_GET['checkout_time'] );
    }
    return $cart_item_data;
}
add_filter( 'woocommerce_add_cart_item_data', 'add_times_to_cart_item_data', 10, 3 );

// / Display Times in Cart and Checkout
// 
function display_times_in_cart( $item_data, $cart_item ) {
    if ( isset( $cart_item['checkin_time'] ) ) {
        $item_data[] = array(
            'name' => 'Check-in Time',
            'value' => $cart_item['checkin_time']
        );
    }
    if ( isset( $cart_item['checkout_time'] ) ) {
        $item_data[] = array(
            'name' => 'Check-out Time',
            'value' => $cart_item['checkout_time']
        );
    }
    return $item_data;
}
add_filter( 'woocommerce_get_item_data', 'display_times_in_cart', 10, 2 );

//Pass Times to Order Details
//
function add_times_to_order_items( $item, $cart_item_key, $values, $order ) {
    if ( isset( $values['checkin_time'] ) ) {
        $item->add_meta_data( 'Check-in Time', $values['checkin_time'] );
    }
    if ( isset( $values['checkout_time'] ) ) {
        $item->add_meta_data( 'Check-out Time', $values['checkout_time'] );
    }
}
add_action( 'woocommerce_checkout_create_order_line_item', 'add_times_to_order_items', 10, 4 );

// Display Times in WooCommerce Admin and Emails
// 
function display_times_in_emails( $item, $order, $plain_text ) {
    echo '<p><strong>Check-in Time:</strong> ' . $item->get_meta( 'Check-in Time' ) . '</p>';
    echo '<p><strong>Check-out Time:</strong> ' . $item->get_meta( 'Check-out Time' ) . '</p>';
}
add_action( 'woocommerce_email_order_meta', 'display_times_in_emails', 10, 3 );

//sending guest user to users 

