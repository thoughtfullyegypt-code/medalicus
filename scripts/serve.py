#!/usr/bin/env python3
"""
Medalicus Production Static Server with Medical & 3D MIME Types
Ensures proper serving of .glb, .gltf, .wasm, and .json through Cloudflare tunnels and Colab proxies.
"""
import http.server
import socketserver
import os
import sys

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 3000
DIRECTORY = sys.argv[2] if len(sys.argv) > 2 else "dist"

class MedicalHTTPHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def guess_type(self, path):
        if path.endswith(".glb"):
            return "model/gltf-binary"
        if path.endswith(".gltf"):
            return "model/gltf+json"
        if path.endswith(".wasm"):
            return "application/wasm"
        if path.endswith(".json"):
            return "application/json"
        if path.endswith(".svg"):
            return "image/svg+xml"
        return super().guess_type(path)

    def end_headers(self):
        # Enable CORS and caching headers for 3D assets
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "*")
        super().end_headers()

if __name__ == "__main__":
    if not os.path.exists(DIRECTORY):
        print(f"Error: Directory '{DIRECTORY}' does not exist. Run 'npm run build' first.")
        sys.exit(1)

    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), MedicalHTTPHandler) as httpd:
        print(f"✓ Medalicus production server active on http://0.0.0.0:{PORT} (Serving '{DIRECTORY}')")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server.")
