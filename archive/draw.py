import pygame

# Initialize Pygame
pygame.init()

# Config
WINDOW_SIZE = (640, 360)
WINDOW_NAME = "Face Recognition"
FPS = 60
display = pygame.display.set_mode(WINDOW_SIZE)
pygame.display.set_caption(WINDOW_NAME)