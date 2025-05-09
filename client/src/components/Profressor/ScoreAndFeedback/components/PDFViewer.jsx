import React, { useState, useMemo, useEffect, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import {
  Box,
  Paper,
  CircularProgress,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import CommentIcon from "@mui/icons-material/Comment";
import CreditScoreIcon from "@mui/icons-material/CreditScore";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const PDFViewer = ({
  fileUrl,
  currentPage,
  scale,
  onPageChange,
  commentIcons,
  onCommentIconClick,
  onContextMenu,
  onPanelChange,
  activePanel = "scores",
}) => {
  const [numPages, setNumPages] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageElements, setPageElements] = useState({});
  const containerRef = useRef(null);
  const pageRefs = useRef({});
  const [visiblePageNumber, setVisiblePageNumber] = useState(1);
  const [pdfDimensions, setPdfDimensions] = useState({ width: 0, height: 0 });

  // Memoize the options object
  const pdfOptions = useMemo(
    () => ({
      cMapUrl: "https://unpkg.com/pdfjs-dist@3.4.120/cmaps/",
      cMapPacked: true,
      standardFontDataUrl: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/standard_fonts/`,
    }),
    []
  );

  // Memoize the file object
  const file = useMemo(
    () => ({
      url: `http://localhost:5001/pdf?url=${encodeURIComponent(fileUrl)}`,
    }),
    [fileUrl]
  );

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setLoading(false);

    // Initialize pageRefs with empty objects for each page
    const newPageRefs = {};
    for (let i = 1; i <= numPages; i++) {
      newPageRefs[i] = React.createRef();
    }
    pageRefs.current = newPageRefs;
  };

  // Track scroll position and update current page
  useEffect(() => {
    const container = containerRef.current;
    if (!container || numPages === null) return;

    const handleScroll = () => {
      // Find which page is most visible in the viewport
      const containerTop = container.scrollTop;
      const containerHeight = container.clientHeight;
      const containerBottom = containerTop + containerHeight;

      let maxVisibleArea = 0;
      let mostVisiblePage = currentPage;

      for (let i = 1; i <= numPages; i++) {
        const pageElement = document.querySelector(
          `.page-${i} .react-pdf__Page__textContent`
        );
        if (!pageElement) continue;

        const rect = pageElement.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        // Calculate how much of the page is visible
        const pageTop = rect.top - containerRect.top + container.scrollTop;
        const pageBottom = pageTop + rect.height;

        // If page is not in view at all, skip
        if (pageBottom < containerTop || pageTop > containerBottom) continue;

        // Calculate visible area
        const visibleTop = Math.max(containerTop, pageTop);
        const visibleBottom = Math.min(containerBottom, pageBottom);
        const visibleArea = visibleBottom - visibleTop;

        if (visibleArea > maxVisibleArea) {
          maxVisibleArea = visibleArea;
          mostVisiblePage = i;
        }
      }

      // Only update if the most visible page has changed
      if (mostVisiblePage !== visiblePageNumber) {
        setVisiblePageNumber(mostVisiblePage);
        onPageChange(mostVisiblePage);
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [numPages, onPageChange, visiblePageNumber, currentPage]);

  // Scroll to current page when currentPage changes externally
  useEffect(() => {
    if (currentPage !== visiblePageNumber) {
      // Wait for pages to render
      setTimeout(() => {
        const pageElement = document.querySelector(`.page-${currentPage}`);
        if (pageElement && containerRef.current) {
          containerRef.current.scrollTo({
            top: pageElement.offsetTop,
            behavior: "smooth",
          });
        }
      }, 100);
    }
  }, [currentPage, visiblePageNumber]);

  // Handle navigation to the previous page
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);

      // Scroll to the page
      setTimeout(() => {
        const pageElement = document.querySelector(`.page-${currentPage - 1}`);
        if (pageElement && containerRef.current) {
          containerRef.current.scrollTo({
            top: pageElement.offsetTop,
            behavior: "smooth",
          });
        }
      }, 100);
    }
  };

  // Handle navigation to the next page
  const handleNextPage = () => {
    if (numPages && currentPage < numPages) {
      onPageChange(currentPage + 1);

      // Scroll to the page
      setTimeout(() => {
        const pageElement = document.querySelector(`.page-${currentPage + 1}`);
        if (pageElement && containerRef.current) {
          containerRef.current.scrollTo({
            top: pageElement.offsetTop,
            behavior: "smooth",
          });
        }
      }, 100);
    }
  };

  // Update page elements ref after each page renders
  const handlePageLoadSuccess = (pageNumber) => {
    setTimeout(() => {
      const pageElement = document.querySelector(`.page-${pageNumber}`);

      if (pageElement) {
        const rect = pageElement.getBoundingClientRect();
        setPageElements((prev) => ({
          ...prev,
          [pageNumber]: rect,
        }));

        // Update PDF dimensions for positioning
        if (pageNumber === currentPage) {
          setPdfDimensions({
            width: rect.width,
            height: rect.height,
          });
        }
      }
    }, 100);
  };

  const renderCommentIcons = () => {
    // Make sure commentIcons is available and is an array
    if (
      !commentIcons ||
      !Array.isArray(commentIcons) ||
      commentIcons.length === 0
    ) {
      return null;
    }

    return commentIcons
      .filter((icon) => icon.pageIndex === currentPage - 1)
      .map((icon) => {
        // Get the page element for current page
        const pageContainer = document.querySelector(`.page-${currentPage}`);

        if (!pageContainer) return null;

        const pageRect = pageContainer.getBoundingClientRect();

        // Calculate icon position based on the position data and page dimensions
        // The position is relative to the PDF page
        const posX = icon.position?.x || 0;
        const posY = icon.position?.y || 100;

        // Position comment icon on the right side of the page
        const rightPosition = pageRect.width - 30;

        return (
          <Tooltip key={icon.id} title={icon.comment} placement="left" arrow>
            <IconButton
              size="small"
              sx={{
                position: "absolute",
                left: `${posX + pageRect.left - containerRef.current.scrollLeft}px`,
                top: `${posY + pageRect.top - containerRef.current.scrollTop}px`,
                backgroundColor: "#fff",
                boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                "&:hover": {
                  backgroundColor: "#f5f5f5",
                },
                zIndex: 1000,
              }}
              onClick={() =>
                onCommentIconClick({
                  id: icon.id,
                  content: { text: "", boundingBox: icon.position },
                  pageIndex: icon.pageIndex,
                  comment: icon.comment,
                })
              }
            >
              <CommentIcon
                sx={{
                  color: icon.highlight_color || "#1976d2",
                }}
              />
            </IconButton>
          </Tooltip>
        );
      });
  };

  return (
    <Paper
      elevation={3}
      sx={{
        flex: 1,
        overflow: "hidden",
        backgroundColor: "#000000", // Lighter background for better visibility
        position: "relative",
        borderRadius: 0,
        m: "auto", // Center horizontally and vertically
        p: 0,
        width: "70%", // Set width to 70% of the container
        height: "100%", // Adjust height as needed
        display: "flex",
        justifyContent: "center", // Center content horizontally
        alignItems: "center", // Center content vertically
      }}
      onContextMenu={onContextMenu}
    >
      {/* Icon Box */}
      {/* Icon Box - Right side controls */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
          gap: 1,
          zIndex: 1000,
          backgroundColor: "#fff",
          boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
          borderRadius: 0,
          p: 1,
          width: "50px",
        }}
      >
        <IconButton
          size="small"
          onClick={() => onPanelChange("scores")}
          sx={{
            backgroundColor:
              activePanel === "scores" ? "#8B5F34" : "transparent",
            color: activePanel === "scores" ? "white" : "inherit",
            borderRadius: 0,
            width: "100%",
            height: "40px",
            "&:hover": {
              backgroundColor: activePanel === "scores" ? "#6B4A2A" : "#f5f5f5",
            },
          }}
        >
          <CreditScoreIcon />
        </IconButton>
        <IconButton
          onClick={() => onPanelChange("comments")}
          sx={{
            backgroundColor:
              activePanel === "comments" ? "#8B5F34" : "transparent",
            color: activePanel === "comments" ? "white" : "inherit",
            borderRadius: 0,
            width: "100%",
            height: "40px",
            "&:hover": {
              backgroundColor:
                activePanel === "comments" ? "#6B4A2A" : "#f5f5f5",
            },
          }}
        >
          <CommentIcon />
        </IconButton>
      </Box>

      {/* Page Navigation Controls - Left side */}
      <Box
        sx={{
          position: "absolute",
          left: 10,
          top: "50%",
          transform: "translateY(-50%)",
          display: "flex",
          flexDirection: "column",
          gap: 2,
          zIndex: 1000,
        }}
      >
        <Tooltip title="Previous page" placement="right">
          <IconButton
            onClick={handlePreviousPage}
            disabled={currentPage <= 1}
            sx={{
              backgroundColor: "rgba(255, 255, 255, 0.7)",
              boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.9)",
              },
              "&.Mui-disabled": {
                backgroundColor: "rgba(255, 255, 255, 0.3)",
              },
            }}
          >
            <ArrowBackIcon />
          </IconButton>
        </Tooltip>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            backgroundColor: "rgba(255, 255, 255, 0.7)",
            borderRadius: 1,
            padding: "4px 8px",
          }}
        >
          <Typography variant="body2" fontWeight="bold">
            {currentPage}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            of {numPages || "?"}
          </Typography>
        </Box>

        <Tooltip title="Next page" placement="right">
          <IconButton
            onClick={handleNextPage}
            disabled={!numPages || currentPage >= numPages}
            sx={{
              backgroundColor: "rgba(255, 255, 255, 0.7)",
              boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.9)",
              },
              "&.Mui-disabled": {
                backgroundColor: "rgba(255, 255, 255, 0.3)",
              },
            }}
          >
            <ArrowForwardIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* PDF Viewer */}
      <Box
        ref={containerRef}
        sx={{
          position: "relative",
          width: "100%",
          height: "100%",
          overflowY: "auto", // Enable vertical scrolling
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start", // Start from the top
          alignItems: "center", // Center PDF horizontally
        }}
      >
        {loading && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              width: "100%",
              position: "absolute",
              top: 0,
              left: 0,
              zIndex: 10,
            }}
          >
            <CircularProgress />
          </Box>
        )}
        <Document
          file={file}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={<CircularProgress />}
          error={<div>Error loading PDF. Please try again.</div>}
          options={pdfOptions}
        >
          {/* Render all pages */}
          {Array.from(new Array(numPages), (el, index) => (
            <div
              key={`page_container_${index + 1}`}
              className={`pdf-page page-${index + 1}`}
              style={{ position: "relative", margin: "10px 0" }}
            >
              <Page
                key={`page_${index + 1}`}
                pageNumber={index + 1}
                scale={scale}
                onLoadSuccess={() => {
                  handlePageLoadSuccess(index + 1);
                  setLoading(false);
                }}
                error={<div>Error loading page {index + 1}</div>}
                inputRef={(ref) => {
                  if (pageRefs.current) {
                    pageRefs.current[index + 1] = ref;
                  }
                }}
                data-page-index={index}
              />
              {/* Render comment icons for this specific page */}
              {/* Render comment icons for this specific page */}
              {index + 1 === currentPage &&
                commentIcons
                  .filter((icon) => icon.pageIndex === index)
                  .map((icon) => {
                    // Get the actual rendered page element
                    const pageElement = document.querySelector(
                      `.page-${index + 1} .react-pdf__Page`
                    );
                    if (!pageElement) return null;

                    // Grab the position from the icon data
                    const posX = icon.position?.x || 0;
                    const posY = icon.position?.y || 0;
                    const posWidth = icon.position?.width || 0;

                    return (
                      <Tooltip
                        key={icon.id}
                        title={icon.comment}
                        placement="left"
                        arrow
                      >
                        <IconButton
                          size="small"
                          sx={{
                            position: "absolute",
                            left: `${posX + posWidth}px`,
                            top: `${posY}px`,
                            backgroundColor: "#fff",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                            zIndex: 1000,
                          }}
                          onClick={() =>
                            onCommentIconClick({
                              id: icon.id,
                              content: { text: "", boundingBox: icon.position },
                              pageIndex: icon.pageIndex,
                              comment: icon.comment,
                            })
                          }
                        >
                          <CommentIcon
                            sx={{
                              color: icon.highlight_color || "#1976d2",
                            }}
                          />
                        </IconButton>
                      </Tooltip>
                    );
                  })}
            </div>
          ))}
        </Document>
      </Box>
    </Paper>
  );
};

export default PDFViewer;
