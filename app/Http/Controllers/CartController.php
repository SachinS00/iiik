<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CartController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    public function index()
    {
        $cartItems = Cart::where('user_id', Auth::id())
            ->with('product')
            ->get();

        $total = $cartItems->sum(function ($item) {
            return $item->quantity * $item->price;
        });

        return view('cart.index', compact('cartItems', 'total'));
    }

    public function add(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
        ]);

        $product = Product::findOrFail($request->product_id);

        // Check if product is already in cart
        $cartItem = Cart::where('user_id', Auth::id())
            ->where('product_id', $request->product_id)
            ->first();

        if ($cartItem) {
            $cartItem->quantity += $request->quantity;
            $cartItem->save();
        } else {
            Cart::create([
                'user_id' => Auth::id(),
                'product_id' => $request->product_id,
                'quantity' => $request->quantity,
                'price' => $product->actual_price,
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Product added to cart successfully!'
        ]);
    }

    public function update(Request $request, Cart $cart)
    {
        $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        if ($cart->user_id !== Auth::id()) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $cart->update(['quantity' => $request->quantity]);

        return response()->json([
            'success' => true,
            'message' => 'Cart updated successfully!'
        ]);
    }

    public function remove(Cart $cart)
    {
        if ($cart->user_id !== Auth::id()) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $cart->delete();

        return response()->json([
            'success' => true,
            'message' => 'Item removed from cart!'
        ]);
    }

    public function count()
    {
        $count = Cart::where('user_id', Auth::id())->sum('quantity');
        return response()->json(['count' => $count]);
    }
}