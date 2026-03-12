import { useState, useRef, useEffect, useCallback } from "react";
import { ReactPhotoSphereViewer } from "react-photo-sphere-viewer";
import { VirtualTourPlugin } from "@photo-sphere-viewer/virtual-tour-plugin";
import "@photo-sphere-viewer/virtual-tour-plugin/index.css";
import "./Walkthrough.css";

// Simple loading hook adapted from your main project (no TypeScript).
function useWalkthroughLoading() {
  const [loadingState, setLoadingState] = useState("idle"); // 'initial' | 'transition' | 'idle'
  const loadingStateRef = useRef("idle");
  const loadStartTimeRef = useRef(0);
  const minTimeTimeoutRef = useRef(null);
  const safetyTimeoutRef = useRef(null);

  const MIN_DISPLAY_TIME = 500;
  const SAFETY_TIMEOUT = 10000;

  const clearTimeouts = useCallback(() => {
    if (minTimeTimeoutRef.current) {
      clearTimeout(minTimeTimeoutRef.current);
      minTimeTimeoutRef.current = null;
    }
    if (safetyTimeoutRef.current) {
      clearTimeout(safetyTimeoutRef.current);
      safetyTimeoutRef.current = null;
    }
  }, []);

  const setLoading = useCallback(
    (state) => {
      if (state !== "idle") {
        clearTimeouts();
        loadStartTimeRef.current = Date.now();
        setLoadingState(state);
        loadingStateRef.current = state;

        safetyTimeoutRef.current = setTimeout(() => {
          setLoadingState("idle");
          loadingStateRef.current = "idle";
        }, SAFETY_TIMEOUT);
      } else {
        clearTimeouts();
        setLoadingState("idle");
        loadingStateRef.current = "idle";
      }
    },
    [clearTimeouts]
  );

  const handleLoadComplete = useCallback(() => {
    if (loadingStateRef.current === "idle") return;

    const elapsed = Date.now() - loadStartTimeRef.current;
    const remaining = Math.max(0, MIN_DISPLAY_TIME - elapsed);

    if (remaining > 0) {
      minTimeTimeoutRef.current = setTimeout(() => {
        setLoadingState("idle");
        loadingStateRef.current = "idle";
        if (safetyTimeoutRef.current) {
          clearTimeout(safetyTimeoutRef.current);
          safetyTimeoutRef.current = null;
        }
      }, remaining);
    } else {
      setLoadingState("idle");
      loadingStateRef.current = "idle";
      if (safetyTimeoutRef.current) {
        clearTimeout(safetyTimeoutRef.current);
        safetyTimeoutRef.current = null;
      }
    }
  }, []);

  useEffect(() => {
    return () => {
      clearTimeouts();
    };
  }, [clearTimeouts]);

  return {
    loadingState,
    loadingStateRef,
    setLoading,
    handleLoadComplete,
  };
}

// Full-page walkthrough component (no modal).
export function Walkthrough({ images, nodeConfigs }) {
  const instanceRef = useRef(null);
  const cleanupListenersRef = useRef(null);

  const { loadingState, loadingStateRef, setLoading, handleLoadComplete } =
    useWalkthroughLoading();

  // Initial loading state when images are available.
  useEffect(() => {
    if (images.length > 0) {
      setLoading("initial");
    } else {
      setLoading("idle");
    }
  }, [images.length, setLoading]);

  useEffect(() => {
    return () => {
      if (cleanupListenersRef.current) {
        cleanupListenersRef.current();
        cleanupListenersRef.current = null;
      }
    };
  }, []);

  const attachViewerListeners = useCallback(
    (instance) => {
      if (!instance || !instance.addEventListener) return;

      const handlePanoramaLoad = () => {
        if (loadingStateRef.current === "idle") {
          setLoading("transition");
        }
      };

      const handlePanoramaLoaded = () => {
        handleLoadComplete();
      };

      const handlePanoramaError = () => {
        setLoading("idle");
      };

      try {
        instance.addEventListener("panorama-load", handlePanoramaLoad);
        instance.addEventListener("panorama-loaded", handlePanoramaLoaded);
        instance.addEventListener("panorama-error", handlePanoramaError);
      } catch {
        // ignore
      }

      cleanupListenersRef.current = () => {
        try {
          instance.removeEventListener("panorama-load", handlePanoramaLoad);
          instance.removeEventListener("panorama-loaded", handlePanoramaLoaded);
          instance.removeEventListener("panorama-error", handlePanoramaError);
        } catch {
          // ignore
        }
      };
    },
    [handleLoadComplete, loadingStateRef, setLoading]
  );

  const handleReady = useCallback(
    (instance) => {
      instanceRef.current = instance;
      attachViewerListeners(instanceRef.current);
      handleLoadComplete();

      const virtualTour = instanceRef.current.getPlugin(VirtualTourPlugin);

      if (!virtualTour || images.length < 1) {
        return;
      }

      const nodes = images.map((image, index) => {
        let links = [];

        if (nodeConfigs && nodeConfigs[index]) {
          const config = nodeConfigs[index];
          links = config.targetNodeIds.map((targetIndex, arrowIndex) => ({
            nodeId: String(targetIndex + 1),
            position: config.arrowPositions[arrowIndex] || {
              textureX: 0,
              textureY: 900,
            },
          }));
        } else {
          const nextIndex = (index + 1) % images.length;
          const horizontalStep = 3600 / images.length;
          links = [
            {
              nodeId: String(nextIndex + 1),
              position: {
                textureX: (index * horizontalStep) % 3600,
                textureY: 900,
              },
            },
          ];
        }

        const nodeConfig = {
          id: String(index + 1),
          panorama: image,
          name: `View ${index + 1}`,
          links,
        };

        if (nodeConfigs && nodeConfigs[index] && nodeConfigs[index].cameraPosition) {
          const { yaw, pitch, roll } = nodeConfigs[index].cameraPosition;
          nodeConfig.panoData = {};

          if (yaw !== undefined) {
            nodeConfig.panoData.poseHeading = (yaw * 180) / Math.PI;
          }
          if (pitch !== undefined) {
            nodeConfig.panoData.posePitch = (pitch * 180) / Math.PI;
          }
          if (roll !== undefined) {
            nodeConfig.panoData.poseRoll = (roll * 180) / Math.PI;
          }
        }

        return nodeConfig;
      });

      // Apply initial camera orientation (for first node) if provided
      if (nodeConfigs && nodeConfigs[0] && nodeConfigs[0].cameraPosition && instanceRef.current) {
        const cameraPos = nodeConfigs[0].cameraPosition;
        const yaw = cameraPos.yaw;
        const pitch = cameraPos.pitch;
        const roll = cameraPos.roll;
        try {
          if (yaw !== undefined) {
            instanceRef.current.setOption("defaultYaw", yaw);
          }
          if (pitch !== undefined) {
            instanceRef.current.setOption("defaultPitch", pitch);
          }
          if (roll !== undefined) {
            instanceRef.current.setOption("defaultRoll", roll);
          }
        } catch {
          // ignore
        }
      }

      virtualTour.setNodes(nodes);

      let previousNodeIndex = null;

      const setZoomToZero = (nodeIndex) => {
        if (!instanceRef.current) return;
        try {
          void nodeIndex;
          instanceRef.current.zoom(0);
        } catch {
          // ignore
        }
      };

      // Ensure initial panorama starts at zoom 0
      setTimeout(() => setZoomToZero(0), 100);
      setTimeout(() => setZoomToZero(0), 300);

      try {
        virtualTour.addEventListener("node-changed", (event) => {
          const nodeId = event?.nodeId || event?.node?.id || event?.id;
          if (!nodeId) return;

          const nodeIndex = parseInt(nodeId, 10) - 1;
          if (Number.isNaN(nodeIndex) || nodeIndex < 0) return;

          // Optional: keep your transition yaw logic if you add it to nodeConfigs
          if (
            previousNodeIndex !== null &&
            nodeConfigs &&
            nodeConfigs[previousNodeIndex] &&
            nodeConfigs[previousNodeIndex].transitionYaws &&
            nodeConfigs[previousNodeIndex].transitionYaws[nodeIndex] !== undefined
          ) {
            const transitionYaw =
              nodeConfigs[previousNodeIndex].transitionYaws[nodeIndex];
            if (instanceRef.current) {
              try {
                const currentPosition = instanceRef.current.getPosition();
                instanceRef.current.rotate({
                  yaw: transitionYaw,
                  pitch: currentPosition.pitch,
                  roll: currentPosition.roll,
                });
              } catch {
                // ignore
              }
            }
          }

          setTimeout(() => setZoomToZero(nodeIndex), 100);
          setTimeout(() => setZoomToZero(nodeIndex), 300);

          previousNodeIndex = nodeIndex;
        });
      } catch {
        // ignore
      }
    },
    [attachViewerListeners, handleLoadComplete, images, nodeConfigs]
  );

  return (
    <section className="wt-shell">
      {images.length > 0 && (
        <div className="wt-container">
          {loadingState !== "idle" && (
            <div
              className="wt-loading-overlay"
              data-variant={loadingState}
              aria-live="polite"
              aria-busy="true"
            >
              <div className="wt-loading-content">
                <div className="wt-spinner" />
                <div className="wt-loading-text">
                  {loadingState === "initial"
                    ? "Loading 360° experience…"
                    : "Loading next view…"}
                </div>
              </div>
            </div>
          )}

          <div className="wt-viewer-container">
            <ReactPhotoSphereViewer
              src={images[0]}
              plugins={[
                [
                  VirtualTourPlugin,
                  {
                    renderMode: "3d",
                    preload: true,
                    transitionOptions: {
                      speed: "20rpm",
                    },
                  },
                ],
              ]}
              height="100%"
              width="100%"
              onReady={handleReady}
              defaultYaw={nodeConfigs?.[0]?.cameraPosition?.yaw ?? 0}
              defaultPitch={nodeConfigs?.[0]?.cameraPosition?.pitch ?? 0}
            />
          </div>
        </div>
      )}
    </section>
  );
}

