import threading
import tkinter as tk
from tkinter import filedialog, messagebox, ttk
from typing import Optional

import cv2
import numpy as np
from PIL import Image, ImageTk

from light_restyle.io_utils import InvalidImageError, load_image, resize_preserving_aspect
from light_restyle.pipeline import _blend_images, process_image_in_memory, run_pipeline
from light_restyle.style_transfer import ModelLoadError

class LightRestyleApp(tk.Tk):
    def __init__(self) -> None:
        super().__init__()
        self.title("Light & Airy Restyle")
        self.geometry("800x600")
        self.resizable(True, True)

        self.input_path = tk.StringVar()
        self.output_path = tk.StringVar()
        self.intensity = tk.DoubleVar(value=1.0)
        self.status = tk.StringVar(value="Ready")
        
        self.preview_original: Optional[np.ndarray] = None
        self.preview_graded: Optional[np.ndarray] = None
        self.tk_image: Optional[ImageTk.PhotoImage] = None

        self._build_ui()

    def _build_ui(self) -> None:
        control_frame = ttk.Frame(self)
        control_frame.pack(side=tk.BOTTOM, fill=tk.X, padx=10, pady=10)

        input_frame = ttk.Frame(control_frame)
        input_frame.pack(fill=tk.X, pady=2)
        ttk.Label(input_frame, text="Input:", width=8).pack(side=tk.LEFT)
        ttk.Entry(input_frame, textvariable=self.input_path, state="readonly").pack(
            side=tk.LEFT, fill=tk.X, expand=True, padx=5
        )
        ttk.Button(input_frame, text="Browse", command=self._select_input).pack(side=tk.RIGHT)

        output_frame = ttk.Frame(control_frame)
        output_frame.pack(fill=tk.X, pady=2)
        ttk.Label(output_frame, text="Output:", width=8).pack(side=tk.LEFT)
        ttk.Entry(output_frame, textvariable=self.output_path, state="readonly").pack(
            side=tk.LEFT, fill=tk.X, expand=True, padx=5
        )
        ttk.Button(output_frame, text="Browse", command=self._select_output).pack(side=tk.RIGHT)

        slider_frame = ttk.Frame(control_frame)
        slider_frame.pack(fill=tk.X, pady=5)
        ttk.Label(slider_frame, text="Intensity:", width=8).pack(side=tk.LEFT)
        self.slider = ttk.Scale(
            slider_frame, variable=self.intensity, from_=0.0, to=1.0, orient=tk.HORIZONTAL,
            command=self._on_slider_change
        )
        self.slider.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=5)

        ttk.Label(control_frame, textvariable=self.status).pack(pady=5)

        self.run_btn = ttk.Button(
            control_frame, text="Save High-Res Output", command=self._save_high_res
        )
        self.run_btn.pack()

        self.canvas_frame = ttk.Frame(self)
        self.canvas_frame.pack(side=tk.TOP, fill=tk.BOTH, expand=True, padx=10, pady=10)
        self.image_label = ttk.Label(self.canvas_frame, text="Select an image to generate a live preview.", anchor=tk.CENTER)
        self.image_label.pack(fill=tk.BOTH, expand=True)
        
        self.bind("<Configure>", self._on_resize)

    def _update_status(self, msg: str) -> None:
        self.status.set(msg)

    def _select_input(self) -> None:
        path = filedialog.askopenfilename(
            filetypes=[("Image Files", "*.jpg;*.jpeg;*.png;*.webp")]
        )
        if path:
            self.input_path.set(path)
            if not self.output_path.get():
                parts = path.rsplit(".", 1)
                self.output_path.set(f"{parts[0]}_airy.{parts[1]}")
            
            self._start_preview_generation(path)

    def _select_output(self) -> None:
        path = filedialog.asksaveasfilename(
            defaultextension=".jpg",
            filetypes=[("JPEG", "*.jpg;*.jpeg"), ("PNG", "*.png"), ("WEBP", "*.webp")]
        )
        if path:
            self.output_path.set(path)

    def _start_preview_generation(self, path: str) -> None:
        self.run_btn.config(state="disabled")
        self.slider.config(state="disabled")
        self.preview_original = None
        self.preview_graded = None
        threading.Thread(target=self._generate_preview_thread, args=(path,), daemon=True).start()

    def _generate_preview_thread(self, path: str) -> None:
        try:
            self._update_status("Loading thumbnail for preview...")
            image = load_image(path)
            thumbnail = resize_preserving_aspect(image, 600)
            self.preview_original = thumbnail
            
            self._update_display()
            
            graded = process_image_in_memory(thumbnail, progress_callback=self._update_status)
            self.preview_graded = graded
            
            self._update_status("Preview ready. Drag slider to see changes!")
            self._update_display()
        except Exception as e:
            self._update_status(f"Preview generation failed: {e}")
        finally:
            self.run_btn.config(state="normal")
            self.slider.config(state="normal")

    def _on_slider_change(self, *args) -> None:
        self._update_display()

    def _on_resize(self, event) -> None:
        if event.widget == self:
            self._update_display()

    def _update_display(self) -> None:
        if self.preview_original is None:
            return

        if self.preview_graded is not None:
            img_array = _blend_images(self.preview_original, self.preview_graded, self.intensity.get())
        else:
            img_array = self.preview_original

        image = Image.fromarray(img_array)
        
        canvas_width = self.canvas_frame.winfo_width()
        canvas_height = self.canvas_frame.winfo_height()
        
        if canvas_width > 10 and canvas_height > 10:
            image.thumbnail((canvas_width, canvas_height), Image.Resampling.LANCZOS)
            
        self.tk_image = ImageTk.PhotoImage(image)
        self.image_label.config(image=self.tk_image, text="")

    def _save_high_res(self) -> None:
        if not self.input_path.get() or not self.output_path.get():
            messagebox.showwarning("Warning", "Please select input and output paths.")
            return

        self.run_btn.config(state="disabled")
        self.slider.config(state="disabled")
        threading.Thread(target=self._save_high_res_thread, daemon=True).start()

    def _save_high_res_thread(self) -> None:
        try:
            run_pipeline(
                self.input_path.get(), 
                self.output_path.get(), 
                self.intensity.get(),
                progress_callback=self._update_status
            )
            self._update_status("Success! High-res image saved.")
            messagebox.showinfo("Success", "Pipeline completed successfully!")
        except Exception as e:
            self._update_status("Error saving high-res image.")
            messagebox.showerror("Error", f"Failed to save: {e}")
        finally:
            self.run_btn.config(state="normal")
            self.slider.config(state="normal")

def launch_gui() -> None:
    app = LightRestyleApp()
    app.mainloop()
